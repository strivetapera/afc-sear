import { getPrismaClient } from './prisma';
import { toEventDetailView, toRegistrationView, toAdminRegistrationView, toCheckInView } from './mappers';
export async function listPublicEvents() {
    const prisma = getPrismaClient();
    const events = await prisma.event.findMany({
        where: {
            status: 'PUBLISHED',
            visibility: 'PUBLIC'
        },
        include: {
            venue: true,
            schedules: {
                orderBy: { startsAt: 'asc' }
            },
            ticketTypes: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return events.map(toEventDetailView);
}
export async function getEventBySlug(slug) {
    const prisma = getPrismaClient();
    const event = await prisma.event.findUnique({
        where: { slug },
        include: {
            venue: true,
            schedules: {
                orderBy: { startsAt: 'asc' }
            },
            ticketTypes: true,
            registrationForm: true
        }
    });
    return event ? toEventDetailView(event) : null;
}
export async function registerForEvent(eventSlug, input) {
    const prisma = getPrismaClient();
    const event = await prisma.event.findUniqueOrThrow({
        where: { slug: eventSlug }
    });
    const totalMinor = 0; // Simplified for now
    const registration = await prisma.registration.create({
        data: {
            eventId: event.id,
            personId: input.personId ?? null,
            status: 'PENDING',
            totalMinor,
            currencyCode: 'USD',
            paymentStatus: 'NOT_APPLICABLE',
            attendees: {
                create: input.attendees.map(a => ({
                    fullName: a.fullName,
                    ticketTypeId: a.ticketTypeId,
                    metadata: a.metadata ?? {}
                }))
            }
        },
        include: {
            attendees: true
        }
    });
    return toRegistrationView(registration);
}
export async function listEventRegistrations(eventId, page = 1, pageSize = 50) {
    const prisma = getPrismaClient();
    const registrations = await prisma.registration.findMany({
        where: { eventId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
            attendees: {
                include: {
                    ticketType: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return registrations.map(toAdminRegistrationView);
}
export async function recordCheckIn(attendeeId, checkedById) {
    const prisma = getPrismaClient();
    return prisma.$transaction(async (tx) => {
        // 1. Update attendee status
        await tx.registrationAttendee.update({
            where: { id: attendeeId },
            data: { checkInStatus: 'CHECKED_IN' },
        });
        // 2. Create check-in record
        const checkIn = await tx.checkIn.create({
            data: {
                registrationAttendeeId: attendeeId,
                checkedInById: checkedById,
            },
        });
        return toCheckInView(checkIn);
    });
}
// ─── Admin event CRUD ─────────────────────────────────────────────────────────
export async function listAdminEvents(page = 1, pageSize = 50) {
    const prisma = getPrismaClient();
    const events = await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
            venue: true,
            schedules: { orderBy: { startsAt: 'asc' } },
            ticketTypes: true,
            _count: { select: { registrations: true } },
        },
    });
    return events.map(toEventDetailView);
}
export async function createEvent(input) {
    const prisma = getPrismaClient();
    const event = await prisma.event.create({
        data: {
            title: input.title,
            slug: input.slug,
            summary: input.summary ?? null,
            description: input.description ?? {},
            eventType: input.eventType ?? 'SERVICE',
            visibility: input.visibility ?? 'PUBLIC',
            registrationMode: input.registrationMode ?? 'OPEN',
            status: 'DRAFT',
            branchId: input.branchId ?? null,
            venueId: input.venueId ?? null,
        },
        include: {
            venue: true,
            schedules: true,
            ticketTypes: true,
        },
    });
    return toEventDetailView(event);
}
export async function updateEvent(id, input) {
    const prisma = getPrismaClient();
    const event = await prisma.event.update({
        where: { id },
        data: {
            ...(input.title !== undefined && { title: input.title }),
            ...(input.slug !== undefined && { slug: input.slug }),
            ...(input.summary !== undefined && { summary: input.summary }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.eventType !== undefined && { eventType: input.eventType }),
            ...(input.visibility !== undefined && { visibility: input.visibility }),
            ...(input.registrationMode !== undefined && { registrationMode: input.registrationMode }),
            ...(input.status !== undefined && { status: input.status }),
            ...(input.venueId !== undefined && { venueId: input.venueId }),
        },
        include: {
            venue: true,
            schedules: { orderBy: { startsAt: 'asc' } },
            ticketTypes: true,
        },
    });
    return toEventDetailView(event);
}
export async function addSchedule(eventId, input) {
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
export async function addTicketType(eventId, input) {
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
//# sourceMappingURL=event-repository.js.map