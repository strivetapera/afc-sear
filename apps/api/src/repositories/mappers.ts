import type {
  Branch,
  ContentItem,
  ContentStatus,
  ContentType,
  ContentVersion,
  Person,
  User,
  UserRole,
  VisibilityScope,
} from '@prisma/client';
import type {
  AuthenticatedUserView,
  BranchView,
  ContentItemView,
  ContentVersionView,
  AdminRegistrationView,
  CheckInView,
  EventDetailView,
  EventScheduleView,
  PersonView,
  RegistrationAttendeeView,
  RegistrationInventoryView,
  RegistrationPolicyView,
  RegistrationReceiptView,
  RegistrationView,
  TicketTypeView,
  VenueView,
  WaitlistEntryView,
} from '../modules';

// Existing types...
type UserWithRoles = User & {
  userRoles: Array<
    UserRole & {
      role: {
        key: string;
      };
    }
  >;
};

type ContentItemWithRelations = ContentItem & {
  contentType: Pick<ContentType, 'key'>;
  versions?: ContentVersion[];
};

// Event types...
type EventWithRelations = any; // Will refine once types are stable
type RegistrationWithRelations = any;

function mapContentStatus(status: ContentStatus): ContentItemView['status'] {
  return status;
}

function mapVisibility(visibility: VisibilityScope): ContentItemView['visibility'] {
  return visibility;
}

// ... existing authenticated user, branch, person, content mappers ...

export function toVenueView(venue: any): VenueView {
  return {
    id: venue.id,
    name: venue.name,
    city: venue.city,
    addressLine1: venue.addressLine1,
    isVirtual: venue.isVirtual,
  };
}

export function toTicketTypeView(ticket: any): TicketTypeView {
  return {
    id: ticket.id,
    name: ticket.name,
    priceMinor: ticket.priceMinor,
    currencyCode: ticket.currencyCode,
    capacity: ticket.capacity,
  };
}

export function toRegistrationInventoryView(inventory: any): RegistrationInventoryView {
  return {
    id: inventory.id,
    category: inventory.category,
    name: inventory.name,
    capacity: inventory.capacity,
    remainingCapacity: inventory.remainingCapacity ?? inventory.capacity,
    isActive: inventory.isActive,
    metadata: inventory.metadata ?? null,
  };
}

export function toRegistrationPolicyView(policy: any): RegistrationPolicyView {
  return {
    codePrefix: policy.codePrefix,
    nextSequence: policy.nextSequence,
    paymentDeadline: policy.paymentDeadline?.toISOString?.() ?? policy.paymentDeadline ?? null,
    cancellationDeadline: policy.cancellationDeadline?.toISOString?.() ?? policy.cancellationDeadline ?? null,
    requireFullPaymentForCheckIn: policy.requireFullPaymentForCheckIn,
    allowWaitlist: policy.allowWaitlist,
    allowSelfServiceLookup: policy.allowSelfServiceLookup,
    supportedChannels: Array.isArray(policy.supportedChannels)
      ? policy.supportedChannels
      : Array.isArray(policy.supportedChannels?.channels)
        ? policy.supportedChannels.channels
        : [],
    pricingRules: Array.isArray(policy.pricingRules) ? policy.pricingRules : [],
    confirmationConfig: policy.confirmationConfig ?? null,
  };
}

export function toEventScheduleView(schedule: any): EventScheduleView {
  return {
    startsAt: schedule.startsAt.toISOString(),
    endsAt: schedule.endsAt.toISOString(),
    timezone: schedule.timezone,
    recurrenceRule: schedule.recurrenceRule,
    virtualJoinUrl: schedule.virtualJoinUrl,
  };
}

export function toEventDetailView(event: any): EventDetailView {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    summary: event.summary,
    description: event.description,
    eventType: event.eventType,
    visibility: event.visibility,
    status: event.status,
    registrationMode: event.registrationMode,
    venue: event.venue ? toVenueView(event.venue) : null,
    schedules: event.schedules?.map(toEventScheduleView) ?? [],
    ticketTypes: event.ticketTypes?.map(toTicketTypeView) ?? [],
    registrationFormSchema: event.registrationForm?.schema ?? null,
    registrationPolicy: event.registrationPolicy ? toRegistrationPolicyView(event.registrationPolicy) : null,
    registrationInventory: event.registrationInventory?.map(toRegistrationInventoryView) ?? [],
  };
}

export function toRegistrationView(reg: any): RegistrationView {
  return {
    id: reg.id,
    registrationCode: reg.registrationCode,
    status: reg.status,
    totalMinor: reg.totalMinor,
    amountPaidMinor: reg.amountPaidMinor ?? 0,
    amountOutstandingMinor: Math.max(0, (reg.totalMinor ?? 0) - (reg.amountPaidMinor ?? 0)),
    currencyCode: reg.currencyCode,
    paymentStatus: reg.paymentStatus,
    channel: reg.channel,
    contactEmail: reg.contactEmail ?? null,
    contactPhone: reg.contactPhone ?? null,
    qrCodePayload: reg.qrCodePayload ?? null,
    createdAt: reg.createdAt.toISOString(),
  };
}

export function toRegistrationAttendeeView(attendee: any): RegistrationAttendeeView {
  return {
    id: attendee.id,
    fullName: attendee.fullName,
    inventory: attendee.inventory ? toRegistrationInventoryView(attendee.inventory) : null,
    ticketType: attendee.ticketType ? toTicketTypeView(attendee.ticketType) : null,
    metadata: attendee.metadata,
  };
}

export function toAdminRegistrationView(reg: any): AdminRegistrationView {
  return {
    ...toRegistrationView(reg),
    attendees: reg.attendees?.map(toRegistrationAttendeeView) ?? [],
    receipts: reg.receipts?.map(toRegistrationReceiptView) ?? [],
  };
}

export function toCheckInView(checkIn: any): CheckInView {
  return {
    id: checkIn.id,
    attendeeId: checkIn.registrationAttendeeId,
    checkedInAt: checkIn.checkedInAt.toISOString(),
  };
}

export function toRegistrationReceiptView(receipt: any): RegistrationReceiptView {
  return {
    id: receipt.id,
    receiptNumber: receipt.receiptNumber,
    amountMinor: receipt.amountMinor,
    currencyCode: receipt.currencyCode,
    paymentMethod: receipt.paymentMethod ?? null,
    note: receipt.note ?? null,
    receivedAt: receipt.receivedAt.toISOString(),
  };
}

export function toWaitlistEntryView(entry: any): WaitlistEntryView {
  return {
    id: entry.id,
    waitlistCode: entry.waitlistCode,
    firstName: entry.firstName,
    lastName: entry.lastName,
    branchName: entry.branchName ?? null,
    ageGroup: entry.ageGroup ?? null,
    email: entry.email ?? null,
    phone: entry.phone ?? null,
    status: entry.status,
    inventory: entry.inventory ? toRegistrationInventoryView(entry.inventory) : null,
    createdAt: entry.createdAt.toISOString(),
    activatedAt: entry.activatedAt?.toISOString() ?? null,
  };
}

export function toAuthenticatedUserView(user: UserWithRoles): AuthenticatedUserView {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone ?? null,
    status: user.status,
    defaultBranchId: user.defaultBranchId ?? null,
    roleKeys: user.userRoles.map((item) => item.role.key),
    branchScopeIds: user.userRoles
      .map((item) => item.branchId)
      .filter((value): value is string => Boolean(value)),
  };
}

export function toBranchView(branch: Branch): BranchView {
  return {
    id: branch.id,
    countryId: branch.countryId,
    name: branch.name,
    slug: branch.slug,
    type: branch.type,
    email: branch.email ?? null,
    phone: branch.phone ?? null,
    city: branch.city ?? null,
    isPublic: branch.isPublic,
  };
}

export function toPersonView(person: Person): PersonView {
  return {
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    preferredName: person.preferredName ?? null,
    email: person.email ?? null,
    phone: person.phone ?? null,
    branchId: person.branchId ?? null,
    lifecycleStage: person.lifecycleStage,
  };
}

export function toContentVersionView(version: ContentVersion): ContentVersionView {
  return {
    id: version.id,
    versionNumber: version.versionNumber,
    createdAt: version.createdAt.toISOString(),
    changeNote: version.changeNote ?? null,
  };
}

export function toContentItemView(contentItem: ContentItemWithRelations): ContentItemView {
  const latestBody = contentItem.versions?.[0]?.body;

  return {
    id: contentItem.id,
    contentTypeKey: contentItem.contentType.key,
    branchId: contentItem.branchId ?? null,
    title: contentItem.title,
    slug: contentItem.slug,
    summary: contentItem.summary ?? null,
    createdAt: contentItem.createdAt.toISOString(),
    updatedAt: contentItem.updatedAt.toISOString(),
    status: mapContentStatus(contentItem.status),
    visibility: mapVisibility(contentItem.visibility),
    publishedAt: contentItem.publishedAt?.toISOString() ?? null,
    versions: contentItem.versions?.map(toContentVersionView),
    body: latestBody && typeof latestBody === 'object' ? (latestBody as Record<string, unknown>) : null,
    metadata:
      contentItem.metadata && typeof contentItem.metadata === 'object'
        ? (contentItem.metadata as Record<string, unknown>)
        : null,
  };
}
