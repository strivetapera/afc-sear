import { getPrismaClient } from './prisma';
import type { Prisma } from '@prisma/client';
import {
  toAdminRegistrationView,
  toCheckInView,
  toEventDetailView,
  toRegistrationView,
  toWaitlistEntryView,
} from './mappers';
import type {
  RegisterForEventRequest,
  RegisterForEventWaitlistRequest,
} from '../modules';

const baseEventInclude = {
  venue: true,
  schedules: {
    orderBy: { startsAt: 'asc' as const },
  },
  ticketTypes: true,
  registrationForm: true,
  registrationPolicy: true,
  registrationInventory: {
    orderBy: [{ category: 'asc' as const }, { name: 'asc' as const }],
  },
} satisfies Prisma.EventInclude;

const adminEventInclude = {
  ...baseEventInclude,
  _count: { select: { registrations: true, waitlistEntries: true } },
} satisfies Prisma.EventInclude;

const registrationInclude = {
  attendees: {
    include: {
      ticketType: true,
      inventory: true,
    },
  },
  receipts: {
    orderBy: {
      receivedAt: 'desc' as const,
    },
  },
} satisfies Prisma.RegistrationInclude;

const registrationCreateInclude = {
  attendees: {
    include: {
      ticketType: true,
      inventory: true,
    },
  },
  receipts: true,
} satisfies Prisma.RegistrationInclude;

type PrismaClientLike = ReturnType<typeof getPrismaClient> | Prisma.TransactionClient;
type EventWithRelations = Prisma.EventGetPayload<{ include: typeof baseEventInclude }>;
type AdminEventWithRelations = Prisma.EventGetPayload<{ include: typeof adminEventInclude }>;
type RegistrationWithRelations = Prisma.RegistrationGetPayload<{ include: typeof registrationInclude }>;
type RegistrationWithCreatedRelations = Prisma.RegistrationGetPayload<{ include: typeof registrationCreateInclude }>;
type WaitlistEntryWithInventory = Prisma.RegistrationWaitlistEntryGetPayload<{
  include: {
    inventory: true;
  };
}>;
type WaitlistEntryWithEvent = Prisma.RegistrationWaitlistEntryGetPayload<{
  include: {
    event: {
      include: typeof baseEventInclude;
    };
    inventory: true;
  };
}>;
type PricingRule = {
  inventoryId?: string;
  inventoryName?: string;
  inventoryCategory?: string;
  amountMinor?: number;
} & Record<string, any>;
type EventWithRemainingInventory<T extends { registrationInventory?: Array<{ id: string; capacity: number }> }> = Omit<
  T,
  'registrationInventory'
> & {
  registrationInventory: Array<
    T['registrationInventory'] extends Array<infer Inventory>
      ? Inventory & { remainingCapacity: number }
      : { remainingCapacity: number }
  >;
};

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function defaultCodePrefix(slug: string, title: string) {
  const raw = (slug || title || 'AFM EVENT').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  const compact = parts.map((part) => part.slice(0, 3)).join('').slice(0, 10);
  return compact || 'AFMEVENT';
}

function defaultRegistrationFormSchema() {
  return {
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', required: true },
      { key: 'email', label: 'Email Address', type: 'email', required: true },
      { key: 'phone', label: 'Phone Number', type: 'tel', required: false },
      { key: 'branchName', label: 'Branch', type: 'text', required: false },
      { key: 'ageGroup', label: 'Age Group', type: 'text', required: false },
    ],
  };
}

function defaultRegistrationPolicy(event: {
  slug: string;
  title: string;
  eventType?: string | null;
}) {
  const isConference = event.eventType === 'CONFERENCE';

  return {
    codePrefix: defaultCodePrefix(event.slug, event.title),
    paymentDeadline: null,
    cancellationDeadline: null,
    requireFullPaymentForCheckIn: isConference,
    allowWaitlist: isConference,
    allowSelfServiceLookup: true,
    supportedChannels: ['WEB', 'WHATSAPP', 'ADMIN'],
    pricingRules: [],
    confirmationConfig: {
      successHeading: 'Registration Received!',
      successMessage: 'We have received your registration for this event.',
    },
  };
}

function getSupportedChannels(policy: any): string[] {
  if (!policy?.supportedChannels) {
    return ['WEB', 'WHATSAPP', 'ADMIN'];
  }

  if (Array.isArray(policy.supportedChannels)) {
    return policy.supportedChannels;
  }

  return [];
}

function getPricingRules(policy: any): PricingRule[] {
  if (Array.isArray(policy?.pricingRules)) {
    return policy.pricingRules as PricingRule[];
  }

  return [];
}

async function getInventoryUsageMap(prisma: PrismaClientLike, eventId: string) {
  const registrations = await prisma.registration.findMany({
    where: {
      eventId,
      status: {
        not: 'CANCELED',
      },
    },
    select: {
      attendees: {
        select: {
          inventoryId: true,
        },
      },
    },
  });

  const usage = new Map<string, number>();

  for (const registration of registrations) {
    for (const attendee of registration.attendees) {
      if (!attendee.inventoryId) continue;
      usage.set(attendee.inventoryId, (usage.get(attendee.inventoryId) ?? 0) + 1);
    }
  }

  return usage;
}

async function withRemainingInventory<T extends EventWithRelations | AdminEventWithRelations>(
  event: T,
  prisma: PrismaClientLike
): Promise<EventWithRemainingInventory<T>> {
  const usage = await getInventoryUsageMap(prisma, event.id);
  return {
    ...event,
    registrationInventory: (event.registrationInventory ?? []).map((inventory) => ({
      ...inventory,
      remainingCapacity: Math.max(0, inventory.capacity - (usage.get(inventory.id) ?? 0)),
    })),
  } as unknown as EventWithRemainingInventory<T>;
}

async function reserveRegistrationSequence(
  tx: Prisma.TransactionClient,
  event: Pick<EventWithRelations, 'id' | 'slug' | 'title' | 'eventType'>
) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    let policy = await tx.eventRegistrationPolicy.findUnique({
      where: { eventId: event.id },
    });

    if (!policy) {
      const created = await tx.eventRegistrationPolicy.create({
        data: {
          eventId: event.id,
          ...defaultRegistrationPolicy(event),
          pricingRules: [],
          supportedChannels: ['WEB', 'WHATSAPP', 'ADMIN'],
          confirmationConfig: {
            successHeading: 'Registration Received!',
            successMessage: 'We have received your registration for this event.',
          },
        },
      });
      policy = created;
    }

    const updated = await tx.eventRegistrationPolicy.updateMany({
      where: {
        eventId: event.id,
        nextSequence: policy.nextSequence,
      },
      data: {
        nextSequence: {
          increment: 1,
        },
      },
    });

    if (updated.count === 1) {
      return {
        policy,
        issuedSequence: policy.nextSequence,
      };
    }
  }

  throw new Error('Could not reserve a registration sequence. Please try again.');
}

async function reserveWaitlistSequence(
  tx: Prisma.TransactionClient,
  event: Pick<EventWithRelations, 'id' | 'slug' | 'title' | 'eventType'>
) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    let policy = await tx.eventRegistrationPolicy.findUnique({
      where: { eventId: event.id },
    });

    if (!policy) {
      const created = await tx.eventRegistrationPolicy.create({
        data: {
          eventId: event.id,
          ...defaultRegistrationPolicy(event),
          pricingRules: [],
          supportedChannels: ['WEB', 'WHATSAPP', 'ADMIN'],
          confirmationConfig: {
            successHeading: 'Registration Received!',
            successMessage: 'We have received your registration for this event.',
          },
        },
      });
      policy = created;
    }

    const updated = await tx.eventRegistrationPolicy.updateMany({
      where: {
        eventId: event.id,
        nextWaitlistSequence: policy.nextWaitlistSequence,
      },
      data: {
        nextWaitlistSequence: {
          increment: 1,
        },
      },
    });

    if (updated.count === 1) {
      return {
        policy,
        issuedSequence: policy.nextWaitlistSequence,
      };
    }
  }

  throw new Error('Could not reserve a waitlist sequence. Please try again.');
}

function buildRegistrationCode(prefix: string, sequence: number) {
  return `${prefix}-${new Date().getFullYear()}-${String(sequence).padStart(5, '0')}`;
}

function buildWaitlistCode(prefix: string, sequence: number) {
  return `${prefix}-WL-${new Date().getFullYear()}-${String(sequence).padStart(5, '0')}`;
}

function pickContactEmail(input: RegisterForEventRequest) {
  return (
    input.contactEmail ??
    input.attendees.find((attendee) => attendee.email)?.email ??
    null
  );
}

function pickContactPhone(input: RegisterForEventRequest) {
  return (
    input.contactPhone ??
    input.attendees.find((attendee) => attendee.phone)?.phone ??
    null
  );
}

function calculateRegistrationTotal(event: EventWithRelations, input: RegisterForEventRequest) {
  const ticketMap = new Map<string, EventWithRelations['ticketTypes'][number]>(
    (event.ticketTypes ?? []).map((ticket) => [ticket.id, ticket])
  );
  const inventoryMap = new Map<string, EventWithRelations['registrationInventory'][number]>(
    (event.registrationInventory ?? []).map((inventory) => [inventory.id, inventory])
  );
  const pricingRules = getPricingRules(event.registrationPolicy);

  let totalMinor = 0;

  for (const attendee of input.attendees) {
    if (attendee.ticketTypeId) {
      const ticket = ticketMap.get(attendee.ticketTypeId);
      if (!ticket) {
        throw new Error('Selected ticket type is not available for this event.');
      }
      totalMinor += ticket.priceMinor ?? 0;
    }

    if (attendee.inventoryId) {
      const inventory = inventoryMap.get(attendee.inventoryId);
      if (!inventory) {
        throw new Error('Selected accommodation or inventory slot is invalid.');
      }

      const matchedRule = pricingRules.find((rule) => {
        if (rule.inventoryId && rule.inventoryId === inventory.id) return true;
        if (rule.inventoryName && rule.inventoryName === inventory.name) return true;
        if (rule.inventoryCategory && rule.inventoryCategory === inventory.category) return true;
        return false;
      });

      if (matchedRule?.amountMinor) {
        totalMinor += Number(matchedRule.amountMinor);
      }
    }
  }

  return totalMinor;
}

async function syncRegistrationConfig(
  prisma: PrismaClientLike,
  event: Pick<EventWithRelations, 'id' | 'slug' | 'title' | 'eventType'>,
  input: any
) {
  const policyInput = input.registrationPolicy ?? defaultRegistrationPolicy(event);
  const formSchema = input.registrationFormSchema ?? defaultRegistrationFormSchema();

  await prisma.registrationForm.upsert({
    where: { eventId: event.id },
    update: {
      schema: cloneJson(formSchema),
      status: 'ACTIVE',
    },
    create: {
      eventId: event.id,
      schema: cloneJson(formSchema),
      status: 'ACTIVE',
    },
  });

  await prisma.eventRegistrationPolicy.upsert({
    where: { eventId: event.id },
    update: {
      codePrefix: policyInput.codePrefix || defaultCodePrefix(event.slug, event.title),
      paymentDeadline: policyInput.paymentDeadline ? new Date(policyInput.paymentDeadline) : null,
      cancellationDeadline: policyInput.cancellationDeadline ? new Date(policyInput.cancellationDeadline) : null,
      requireFullPaymentForCheckIn: Boolean(policyInput.requireFullPaymentForCheckIn),
      allowWaitlist: Boolean(policyInput.allowWaitlist),
      allowSelfServiceLookup:
        policyInput.allowSelfServiceLookup === undefined ? true : Boolean(policyInput.allowSelfServiceLookup),
      supportedChannels: cloneJson(policyInput.supportedChannels ?? ['WEB', 'WHATSAPP', 'ADMIN']),
      pricingRules: cloneJson(policyInput.pricingRules ?? []),
      confirmationConfig: cloneJson(policyInput.confirmationConfig ?? defaultRegistrationPolicy(event).confirmationConfig),
    },
    create: {
      eventId: event.id,
      codePrefix: policyInput.codePrefix || defaultCodePrefix(event.slug, event.title),
      paymentDeadline: policyInput.paymentDeadline ? new Date(policyInput.paymentDeadline) : null,
      cancellationDeadline: policyInput.cancellationDeadline ? new Date(policyInput.cancellationDeadline) : null,
      requireFullPaymentForCheckIn: Boolean(policyInput.requireFullPaymentForCheckIn),
      allowWaitlist: Boolean(policyInput.allowWaitlist),
      allowSelfServiceLookup:
        policyInput.allowSelfServiceLookup === undefined ? true : Boolean(policyInput.allowSelfServiceLookup),
      supportedChannels: cloneJson(policyInput.supportedChannels ?? ['WEB', 'WHATSAPP', 'ADMIN']),
      pricingRules: cloneJson(policyInput.pricingRules ?? []),
      confirmationConfig: cloneJson(policyInput.confirmationConfig ?? defaultRegistrationPolicy(event).confirmationConfig),
    },
  });

  if (input.registrationInventory !== undefined) {
    const provided = Array.isArray(input.registrationInventory) ? input.registrationInventory : [];
    const keepIds = provided.map((item: any) => item.id).filter(Boolean);

    if (keepIds.length > 0) {
      await prisma.eventRegistrationInventory.updateMany({
        where: {
          eventId: event.id,
          id: {
            notIn: keepIds,
          },
        },
        data: {
          isActive: false,
        },
      });
    } else {
      await prisma.eventRegistrationInventory.updateMany({
        where: { eventId: event.id },
        data: { isActive: false },
      });
    }

    for (const inventory of provided) {
      if (inventory.id) {
        await prisma.eventRegistrationInventory.update({
          where: { id: inventory.id },
          data: {
            category: inventory.category,
            name: inventory.name,
            capacity: Number(inventory.capacity),
            isActive: inventory.isActive === undefined ? true : Boolean(inventory.isActive),
            metadata: cloneJson(inventory.metadata ?? null),
          },
        });
      } else {
        await prisma.eventRegistrationInventory.create({
          data: {
            eventId: event.id,
            category: inventory.category,
            name: inventory.name,
            capacity: Number(inventory.capacity),
            isActive: inventory.isActive === undefined ? true : Boolean(inventory.isActive),
            metadata: cloneJson(inventory.metadata ?? null),
          },
        });
      }
    }
  }
}

export async function listPublicEvents() {
  const prisma = getPrismaClient();
  const events = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    },
    include: baseEventInclude,
    orderBy: {
      createdAt: 'desc',
    },
  });

  const enriched = await Promise.all(events.map((event) => withRemainingInventory(event, prisma)));
  return enriched.map(toEventDetailView);
}

export async function getEventBySlug(slug: string) {
  const prisma = getPrismaClient();
  const event = await prisma.event.findUnique({
    where: { slug },
    include: baseEventInclude,
  });

  if (!event) {
    return null;
  }

  const enriched = await withRemainingInventory(event, prisma);
  return toEventDetailView(enriched);
}

export async function registerForEvent(eventSlug: string, input: RegisterForEventRequest) {
  const prisma = getPrismaClient();

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: baseEventInclude,
  });

  if (!event || event.status !== 'PUBLISHED') {
    throw new Error('This event is not available for registration.');
  }

  if (event.registrationMode === 'CLOSED') {
    throw new Error('Registration is currently closed for this event.');
  }

  const channel = input.channel ?? 'WEB';
  const supportedChannels = getSupportedChannels(event.registrationPolicy);
  if (supportedChannels.length > 0 && !supportedChannels.includes(channel)) {
    throw new Error(`Registrations from ${channel.toLowerCase()} are not enabled for this event.`);
  }

  const duplicatePhone = pickContactPhone(input);
  const duplicateRegistration = duplicatePhone
    ? await prisma.registration.findFirst({
    where: {
      eventId: event.id,
      contactPhone: duplicatePhone,
      status: {
        not: 'CANCELED',
      },
    },
      })
    : null;

  if (duplicateRegistration) {
    throw new Error('This phone number already has a registration for the selected event.');
  }

  const inventoryUsage = await getInventoryUsageMap(prisma, event.id);
  const inventoryMap = new Map((event.registrationInventory ?? []).map((inventory: any) => [inventory.id, inventory]));

  for (const attendee of input.attendees) {
    if (!attendee.fullName?.trim()) {
      throw new Error('Each attendee must include a full name.');
    }

    if (attendee.inventoryId) {
      const inventory = inventoryMap.get(attendee.inventoryId);
      if (!inventory || !inventory.isActive) {
        throw new Error('One of the selected inventory choices is invalid.');
      }

      const remaining = Math.max(0, inventory.capacity - (inventoryUsage.get(inventory.id) ?? 0));
      if (remaining <= 0) {
        if (event.registrationPolicy?.allowWaitlist) {
          throw new Error(`The selected space is full. Please join the waitlist instead.`);
        }
        throw new Error(`The selected space is full.`);
      }
    }
  }

  const registration = await prisma.$transaction(async (tx) => {
    const freshEvent = await tx.event.findUniqueOrThrow({
      where: { id: event.id },
      include: baseEventInclude,
    });

    const { policy, issuedSequence } = await reserveRegistrationSequence(tx, freshEvent);
    const registrationCode = buildRegistrationCode(policy.codePrefix, issuedSequence);
    const totalMinor = calculateRegistrationTotal(freshEvent, input);
    const paymentStatus = totalMinor > 0 ? 'PENDING' : 'NOT_APPLICABLE';

    return tx.registration.create({
      data: {
        eventId: freshEvent.id,
        registrationCode,
        channel,
        personId: input.personId ?? null,
        status: 'CONFIRMED',
        contactEmail: pickContactEmail(input),
        contactPhone: pickContactPhone(input),
        totalMinor,
        amountPaidMinor: 0,
        currencyCode: freshEvent.ticketTypes?.[0]?.currencyCode ?? 'USD',
        paymentStatus: paymentStatus as any,
        qrCodePayload: registrationCode,
        metadata: cloneJson({
          sourceMetadata: input.metadata ?? {},
          policySnapshot: freshEvent.registrationPolicy ?? null,
          formSchemaSnapshot: freshEvent.registrationForm?.schema ?? null,
        }),
        attendees: {
          create: input.attendees.map((attendee) => ({
            fullName: attendee.fullName,
            ticketTypeId: attendee.ticketTypeId ?? null,
            inventoryId: attendee.inventoryId ?? null,
            metadata: cloneJson({
              email: attendee.email ?? null,
              phone: attendee.phone ?? null,
              branchName: attendee.branchName ?? null,
              ageGroup: attendee.ageGroup ?? null,
              ...(attendee.metadata ?? {}),
            }),
          })),
        },
      },
      include: {
        ...registrationCreateInclude,
      },
    });
  });

  return toRegistrationView(registration);
}

export async function joinEventWaitlist(eventSlug: string, input: RegisterForEventWaitlistRequest) {
  const prisma = getPrismaClient();
  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: baseEventInclude,
  });

  if (!event) {
    throw new Error('This event does not exist.');
  }

  if (!event.registrationPolicy?.allowWaitlist) {
    throw new Error('The waitlist is not enabled for this event.');
  }

  const channel = input.channel ?? 'WEB';
  const supportedChannels = getSupportedChannels(event.registrationPolicy);
  if (supportedChannels.length > 0 && !supportedChannels.includes(channel)) {
    throw new Error(`Waitlist entries from ${channel.toLowerCase()} are not enabled for this event.`);
  }

  const waitlistEntry = await prisma.$transaction(async (tx) => {
    const freshEvent = await tx.event.findUniqueOrThrow({
      where: { id: event.id },
      include: baseEventInclude,
    });
    const { policy, issuedSequence } = await reserveWaitlistSequence(tx, freshEvent);

    return tx.registrationWaitlistEntry.create({
      data: {
        eventId: freshEvent.id,
        inventoryId: input.inventoryId ?? null,
        waitlistCode: buildWaitlistCode(policy.codePrefix, issuedSequence),
        channel,
        firstName: input.firstName,
        lastName: input.lastName,
        branchName: input.branchName ?? null,
        ageGroup: input.ageGroup ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        metadata: cloneJson(input.metadata ?? {}),
        status: 'WAITING',
      },
      include: {
        inventory: true,
      },
    });
  });

  return toWaitlistEntryView({
    ...waitlistEntry,
    inventory: waitlistEntry.inventory
      ? {
          ...waitlistEntry.inventory,
          remainingCapacity: waitlistEntry.inventory.capacity,
        }
      : null,
  });
}

export async function listEventRegistrations(eventId: string, page = 1, pageSize = 50) {
  const prisma = getPrismaClient();
  const registrations = await prisma.registration.findMany({
    where: { eventId },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: registrationInclude,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return registrations.map(toAdminRegistrationView);
}

export async function listEventWaitlistEntries(eventId: string) {
  const prisma = getPrismaClient();
  const entries = await prisma.registrationWaitlistEntry.findMany({
    where: { eventId },
    include: {
      inventory: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return entries.map((entry) =>
    toWaitlistEntryView({
      ...entry,
      inventory: entry.inventory
        ? {
            ...entry.inventory,
            remainingCapacity: entry.inventory.capacity,
          }
        : null,
    })
  );
}

export async function addRegistrationReceipt(
  eventId: string,
  registrationId: string,
  input: {
    receiptNumber: string;
    amountMinor: number;
    currencyCode?: string;
    paymentMethod?: string;
    note?: string;
    receivedAt?: string;
  },
  actorUserId?: string
) {
  const prisma = getPrismaClient();

  const updated = await prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findFirstOrThrow({
      where: {
        id: registrationId,
        eventId,
      },
      include: registrationCreateInclude,
    });

    await tx.registrationReceipt.create({
      data: {
        registrationId: registration.id,
        receiptNumber: input.receiptNumber,
        amountMinor: input.amountMinor,
        currencyCode: input.currencyCode ?? registration.currencyCode,
        paymentMethod: input.paymentMethod ?? null,
        note: input.note ?? null,
        receivedAt: input.receivedAt ? new Date(input.receivedAt) : new Date(),
        recordedById: actorUserId ?? null,
      },
    });

    const nextPaidMinor = registration.amountPaidMinor + input.amountMinor;
    const nextPaymentStatus = nextPaidMinor >= registration.totalMinor && registration.totalMinor > 0 ? 'PAID' : 'PENDING';

    await tx.registration.update({
      where: { id: registration.id },
      data: {
        amountPaidMinor: nextPaidMinor,
        paymentStatus: nextPaymentStatus as any,
      },
    });

    return tx.registration.findUniqueOrThrow({
      where: { id: registration.id },
      include: registrationInclude,
    });
  });

  return toAdminRegistrationView(updated);
}

export async function activateWaitlistEntry(eventId: string, waitlistEntryId: string) {
  const prisma = getPrismaClient();

  return prisma.$transaction(async (tx) => {
    const entry = await tx.registrationWaitlistEntry.findFirstOrThrow({
      where: {
        id: waitlistEntryId,
        eventId,
      },
      include: {
        event: {
          include: baseEventInclude,
        },
        inventory: true,
      },
    });

    if (entry.status !== 'WAITING') {
      throw new Error('Only waiting entries can be activated.');
    }

    if (entry.inventoryId) {
      const usage = await getInventoryUsageMap(tx as any, entry.eventId);
      const remaining = Math.max(0, (entry.inventory?.capacity ?? 0) - (usage.get(entry.inventoryId) ?? 0));
      if (remaining <= 0) {
        throw new Error('The requested inventory item is still full.');
      }
    }

    const { policy, issuedSequence } = await reserveRegistrationSequence(tx, entry.event);
    const registrationCode = buildRegistrationCode(policy.codePrefix, issuedSequence);

    const matchedPricingRule = entry.inventory
      ? getPricingRules(entry.event.registrationPolicy).find(
          (rule) =>
            rule.inventoryId === entry.inventoryId ||
            rule.inventoryName === entry.inventory?.name ||
            rule.inventoryCategory === entry.inventory?.category
        )
      : null;

    const totalMinor = Number(matchedPricingRule?.amountMinor ?? 0);

    const registration = await tx.registration.create({
      data: {
        eventId: entry.eventId,
        registrationCode,
        channel: entry.channel,
        contactEmail: entry.email,
        contactPhone: entry.phone,
        status: 'WAITLISTED',
        totalMinor,
        amountPaidMinor: 0,
        currencyCode: 'USD',
        paymentStatus: totalMinor > 0 ? 'PENDING' : 'NOT_APPLICABLE',
        qrCodePayload: registrationCode,
        metadata: cloneJson({
          sourceWaitlistEntryId: entry.id,
          branchName: entry.branchName,
          ageGroup: entry.ageGroup,
        }),
        attendees: {
          create: [
            {
              fullName: `${entry.firstName} ${entry.lastName}`.trim(),
              inventoryId: entry.inventoryId ?? null,
              metadata: cloneJson({
                email: entry.email ?? null,
                phone: entry.phone ?? null,
                branchName: entry.branchName ?? null,
                ageGroup: entry.ageGroup ?? null,
              }),
            },
          ],
        },
      },
      include: {
        ...registrationCreateInclude,
      },
    });

    await tx.registrationWaitlistEntry.update({
      where: { id: entry.id },
      data: {
        status: 'CONVERTED',
        activatedAt: new Date(),
        convertedRegistrationId: registration.id,
      },
    });

    return toAdminRegistrationView(registration);
  });
}

export async function recordCheckIn(attendeeId: string, checkedById?: string, overridePaymentBlock = false) {
  const prisma = getPrismaClient();

  return prisma.$transaction(async (tx) => {
    const attendee = await tx.registrationAttendee.findUniqueOrThrow({
      where: { id: attendeeId },
      include: {
        registration: {
          include: {
            event: {
              include: {
                registrationPolicy: true,
              },
            },
          },
        },
      },
    });

    const paymentRequired = attendee.registration.event.registrationPolicy?.requireFullPaymentForCheckIn;
    const hasOutstandingBalance = attendee.registration.amountPaidMinor < attendee.registration.totalMinor;

    if (paymentRequired && hasOutstandingBalance && !overridePaymentBlock) {
      throw new Error('Full payment is required before this attendee can be checked in.');
    }

    await tx.registrationAttendee.update({
      where: { id: attendeeId },
      data: { checkInStatus: 'CHECKED_IN' },
    });

    const checkIn = await tx.checkIn.create({
      data: {
        registrationAttendeeId: attendeeId,
        checkedInById: checkedById,
      },
    });

    return toCheckInView(checkIn);
  });
}

export async function listAdminEvents(page = 1, pageSize = 50) {
  const prisma = getPrismaClient();
  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: adminEventInclude,
  });

  const enriched = await Promise.all(events.map((event) => withRemainingInventory(event, prisma)));
  return enriched.map((event) => ({
    ...toEventDetailView(event),
    _count: event._count,
  }));
}

export async function createEvent(input: {
  title: string;
  slug: string;
  summary?: string;
  description?: object;
  eventType?: string;
  visibility?: string;
  registrationMode?: string;
  branchId?: string;
  venueId?: string;
  registrationFormSchema?: any;
  registrationPolicy?: any;
  registrationInventory?: any[];
}) {
  const prisma = getPrismaClient();
  const event = await prisma.event.create({
    data: {
      title: input.title,
      slug: input.slug,
      summary: input.summary ?? null,
      description: input.description ?? {},
      eventType: (input.eventType as any) ?? 'SERVICE',
      visibility: (input.visibility as any) ?? 'PUBLIC',
      registrationMode: (input.registrationMode as any) ?? 'OPEN',
      status: 'DRAFT',
      branchId: input.branchId ?? null,
      venueId: input.venueId ?? null,
    },
    include: baseEventInclude,
  });

  await syncRegistrationConfig(prisma, event, input);
  const refreshed = await prisma.event.findUniqueOrThrow({
    where: { id: event.id },
    include: baseEventInclude,
  });
  const enriched = await withRemainingInventory(refreshed, prisma);
  return toEventDetailView(enriched);
}

export async function updateEvent(id: string, input: Partial<{
  title: string;
  slug: string;
  summary: string;
  description: object;
  eventType: string;
  visibility: string;
  registrationMode: string;
  status: string;
  venueId: string;
  registrationFormSchema: any;
  registrationPolicy: any;
  registrationInventory: any[];
}>) {
  const prisma = getPrismaClient();
  const event = await prisma.event.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.summary !== undefined && { summary: input.summary }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.eventType !== undefined && { eventType: input.eventType as any }),
      ...(input.visibility !== undefined && { visibility: input.visibility as any }),
      ...(input.registrationMode !== undefined && { registrationMode: input.registrationMode as any }),
      ...(input.status !== undefined && { status: input.status as any }),
      ...(input.venueId !== undefined && { venueId: input.venueId }),
    },
    include: baseEventInclude,
  });

  await syncRegistrationConfig(prisma, event, input);
  const refreshed = await prisma.event.findUniqueOrThrow({
    where: { id: event.id },
    include: baseEventInclude,
  });
  const enriched = await withRemainingInventory(refreshed, prisma);
  return toEventDetailView(enriched);
}

export async function addSchedule(eventId: string, input: {
  startsAt: string;
  endsAt: string;
  timezone: string;
  recurrenceRule?: string;
  virtualJoinUrl?: string;
}) {
  const prisma = getPrismaClient();
  return prisma.eventSchedule.create({
    data: {
      eventId,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      timezone: input.timezone,
      recurrenceRule: input.recurrenceRule ?? null,
      virtualJoinUrl: input.virtualJoinUrl ?? null,
    },
  });
}

export async function addTicketType(eventId: string, input: {
  name: string;
  priceMinor?: number;
  currencyCode?: string;
  capacity?: number;
}) {
  const prisma = getPrismaClient();
  return prisma.ticketType.create({
    data: {
      eventId,
      name: input.name,
      priceMinor: input.priceMinor ?? 0,
      currencyCode: input.currencyCode ?? 'USD',
      capacity: input.capacity ?? null,
    },
  });
}
