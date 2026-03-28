"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicEvents = listPublicEvents;
exports.getEventBySlug = getEventBySlug;
exports.registerForEvent = registerForEvent;
exports.listEventRegistrations = listEventRegistrations;
exports.recordCheckIn = recordCheckIn;
exports.listAdminEvents = listAdminEvents;
exports.createEvent = createEvent;
exports.updateEvent = updateEvent;
exports.addSchedule = addSchedule;
exports.addTicketType = addTicketType;
const prisma_1 = require("./prisma");
const mappers_1 = require("./mappers");
async function listPublicEvents() {
    const prisma = (0, prisma_1.getPrismaClient)();
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
    return events.map(mappers_1.toEventDetailView);
}
async function getEventBySlug(slug) {
    const prisma = (0, prisma_1.getPrismaClient)();
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
    return event ? (0, mappers_1.toEventDetailView)(event) : null;
}
async function registerForEvent(eventSlug, input) {
    const prisma = (0, prisma_1.getPrismaClient)();
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
    return (0, mappers_1.toRegistrationView)(registration);
}
async function listEventRegistrations(eventId, page = 1, pageSize = 50) {
    const prisma = (0, prisma_1.getPrismaClient)();
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
    return registrations.map(mappers_1.toAdminRegistrationView);
}
async function recordCheckIn(attendeeId, checkedById) {
    const prisma = (0, prisma_1.getPrismaClient)();
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
        return (0, mappers_1.toCheckInView)(checkIn);
    });
}
// ─── Admin event CRUD ─────────────────────────────────────────────────────────
async function listAdminEvents(page = 1, pageSize = 50) {
    const prisma = (0, prisma_1.getPrismaClient)();
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
    return events.map(mappers_1.toEventDetailView);
}
async function createEvent(input) {
    const prisma = (0, prisma_1.getPrismaClient)();
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
    return (0, mappers_1.toEventDetailView)(event);
}
async function updateEvent(id, input) {
    const prisma = (0, prisma_1.getPrismaClient)();
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
    return (0, mappers_1.toEventDetailView)(event);
}
async function addSchedule(eventId, input) {
    const prisma = (0, prisma_1.getPrismaClient)();
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
async function addTicketType(eventId, input) {
    const prisma = (0, prisma_1.getPrismaClient)();
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