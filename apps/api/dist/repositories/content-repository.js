"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublishedContentBySlug = getPublishedContentBySlug;
exports.listContentItemRecords = listContentItemRecords;
exports.createContentItemRecord = createContentItemRecord;
exports.getContentItemById = getContentItemById;
exports.updateContentItem = updateContentItem;
exports.publishContentItem = publishContentItem;
exports.deleteContentItem = deleteContentItem;
exports.getStructuredPageBySlug = getStructuredPageBySlug;
exports.listPublishedLessons = listPublishedLessons;
exports.getPublicNewsFeed = getPublicNewsFeed;
exports.getPublicEventsFeed = getPublicEventsFeed;
exports.getPublicLiveWebcast = getPublicLiveWebcast;
const platform_store_1 = require("../data/platform-store");
const mappers_1 = require("./mappers");
const prisma_1 = require("./prisma");
async function getPublishedPageBody(slug) {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
        const content = await prisma.contentItem.findFirst({
            where: {
                slug,
                status: 'PUBLISHED',
                contentType: {
                    key: 'page',
                },
            },
            include: {
                versions: {
                    orderBy: {
                        versionNumber: 'desc',
                    },
                    take: 1,
                },
            },
        });
        const latestBody = content?.versions[0]?.body;
        return latestBody && typeof latestBody === 'object'
            ? latestBody
            : null;
    }, () => {
        const item = (0, platform_store_1.getPublishedContentBySlug)(slug);
        return item?.contentTypeKey === 'page' && item.body && typeof item.body === 'object'
            ? item.body
            : null;
    });
}
async function getPublishedContentBySlug(slug) {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
        const content = await prisma.contentItem.findFirst({
            where: {
                slug,
                status: 'PUBLISHED',
            },
            include: {
                contentType: {
                    select: {
                        key: true,
                    },
                },
                versions: {
                    orderBy: {
                        versionNumber: 'desc',
                    },
                    take: 5,
                },
            },
        });
        return content ? (0, mappers_1.toContentItemView)(content) : null;
    }, () => (0, platform_store_1.getPublishedContentBySlug)(slug));
}
async function listContentItemRecords(page = 1, pageSize = 50) {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
        const items = await prisma.contentItem.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                contentType: {
                    select: {
                        key: true,
                    },
                },
                versions: {
                    orderBy: {
                        versionNumber: 'desc',
                    },
                    take: 3,
                },
            },
        });
        return items.map(mappers_1.toContentItemView);
    }, () => (0, platform_store_1.listContentItems)());
}
async function createContentItemRecord(input) {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
        const contentType = await prisma.contentType.findUniqueOrThrow({
            where: {
                key: input.contentTypeKey,
            },
        });
        const created = await prisma.contentItem.create({
            data: {
                contentTypeId: contentType.id,
                branchId: input.branchId ?? null,
                title: input.title,
                slug: input.slug,
                summary: input.summary ?? null,
                visibility: (input.visibility ?? 'PUBLIC'),
                status: 'DRAFT',
            },
            include: {
                contentType: {
                    select: {
                        key: true,
                    },
                },
                versions: true,
            },
        });
        return (0, mappers_1.toContentItemView)(created);
    }, () => (0, platform_store_1.createContentItem)({
        contentTypeKey: input.contentTypeKey,
        branchId: input.branchId,
        title: input.title,
        slug: input.slug,
        summary: input.summary,
        visibility: toSeedVisibility(input.visibility),
    }));
}
async function getContentItemById(id) {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
        const content = await prisma.contentItem.findUnique({
            where: { id },
            include: {
                contentType: {
                    select: { key: true }
                },
                versions: {
                    orderBy: { versionNumber: 'desc' },
                },
                tags: {
                    include: { tag: true },
                },
            },
        });
        return content ? (0, mappers_1.toContentItemView)(content) : null;
    }, async () => {
        throw new Error('getContentItemById not implemented in mock seed store');
    });
}
async function updateContentItem(id, input) {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
        const current = await prisma.contentItem.findUniqueOrThrow({
            where: { id },
            include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } }
        });
        await prisma.contentItem.update({
            where: { id },
            data: {
                title: input.title ?? undefined,
                summary: input.summary ?? undefined,
                visibility: input.visibility ? input.visibility.toUpperCase() : undefined,
                status: input.status ?? undefined,
                publishedAt: input.status === 'PUBLISHED' ? new Date() : undefined,
            },
        });
        if (typeof input.body !== 'undefined') {
            const nextVersionNumber = (current.versions[0]?.versionNumber ?? 0) + 1;
            await prisma.contentVersion.create({
                data: {
                    contentItemId: id,
                    versionNumber: nextVersionNumber,
                    body: input.body,
                }
            });
        }
        const refreshed = await prisma.contentItem.findUniqueOrThrow({
            where: { id },
            include: {
                contentType: { select: { key: true } },
                versions: { orderBy: { versionNumber: 'desc' }, take: 3 },
                tags: { include: { tag: true } },
            },
        });
        return (0, mappers_1.toContentItemView)(refreshed);
    }, async () => {
        throw new Error('updateContentItem not implemented in mock seed store');
    });
}
async function publishContentItem(id) {
    return updateContentItem(id, { status: 'PUBLISHED' });
}
async function deleteContentItem(id) {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
        const deleted = await prisma.contentItem.delete({
            where: { id },
            include: {
                contentType: { select: { key: true } },
                versions: { orderBy: { versionNumber: 'desc' }, take: 3 },
            },
        });
        return (0, mappers_1.toContentItemView)(deleted);
    }, async () => {
        throw new Error('deleteContentItem not implemented in mock seed store');
    });
}
async function getStructuredPageBySlug(slug) {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
        const content = await prisma.contentItem.findFirst({
            where: {
                slug,
                status: 'PUBLISHED',
                contentType: {
                    key: 'page',
                },
            },
            include: {
                versions: {
                    orderBy: {
                        versionNumber: 'desc',
                    },
                    take: 1,
                },
            },
        });
        if (!content) {
            return null;
        }
        const latestBody = content.versions[0]?.body;
        const pageBody = latestBody && typeof latestBody === 'object' ? latestBody : {};
        const bodyRecord = pageBody;
        return {
            eyebrow: stringOrUndefined(bodyRecord.eyebrow),
            title: stringOrUndefined(bodyRecord.title) ?? content.title,
            lead: stringOrUndefined(bodyRecord.lead) ?? content.summary ?? undefined,
            actions: arrayOrUndefined(bodyRecord.actions),
            sections: arrayOrUndefined(bodyRecord.sections),
        };
    }, () => (0, platform_store_1.getStructuredPage)(slug));
}
async function listPublishedLessons() {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
        const items = await prisma.contentItem.findMany({
            where: {
                status: 'PUBLISHED',
                contentType: {
                    key: 'lesson',
                },
            },
            orderBy: [
                {
                    publishedAt: 'desc',
                },
                {
                    createdAt: 'desc',
                },
            ],
            include: {
                contentType: {
                    select: {
                        key: true,
                    },
                },
                versions: {
                    orderBy: {
                        versionNumber: 'desc',
                    },
                    take: 1,
                },
            },
        });
        return items.map(mappers_1.toContentItemView);
    }, () => (0, platform_store_1.listContentItems)()
        .filter((item) => item.contentTypeKey === 'lesson' && item.status === 'PUBLISHED')
        .sort((left, right) => {
        const leftTime = new Date(left.publishedAt ?? left.createdAt ?? 0).getTime();
        const rightTime = new Date(right.publishedAt ?? right.createdAt ?? 0).getTime();
        return rightTime - leftTime;
    }));
}
async function getPublicNewsFeed() {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
        const pageBodyResult = await getPublishedPageBody('news');
        const pageBody = pageBodyResult.data;
        const items = await prisma.contentItem.findMany({
            where: {
                status: 'PUBLISHED',
                contentType: {
                    key: 'news',
                },
            },
            orderBy: {
                publishedAt: 'desc',
            },
        });
        return {
            metadata: {
                eyebrow: stringOrUndefined(pageBody?.eyebrow) ?? 'Updates',
                title: stringOrUndefined(pageBody?.title) ?? 'Latest News',
                lead: stringOrUndefined(pageBody?.lead) ??
                    'Recent announcements, ministry milestones, and verified public-site updates are published here so the website has a single trustworthy news stream while broader coverage is still being rebuilt carefully.',
            },
            items: items.map((item) => {
                const metadata = item.metadata && typeof item.metadata === 'object'
                    ? item.metadata
                    : {};
                return {
                    id: item.id,
                    title: item.title,
                    summary: item.summary ?? '',
                    publishedAt: item.publishedAt?.toISOString() ?? item.createdAt.toISOString(),
                    category: stringOrUndefined(metadata.category) ?? 'Update',
                    location: stringOrUndefined(metadata.location) ?? 'Church Update',
                    status: stringOrUndefined(metadata.status) ?? 'Published',
                };
            }),
        };
    }, () => (0, platform_store_1.getPublicNewsFeed)());
}
async function getPublicEventsFeed() {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
        const pageBodyResult = await getPublishedPageBody('events');
        const pageBody = pageBodyResult.data;
        const items = await prisma.contentItem.findMany({
            where: {
                status: 'PUBLISHED',
                contentType: {
                    key: 'event',
                },
            },
            orderBy: {
                title: 'asc',
            },
        });
        const eventItems = items.map(toPublicEventView).filter(isPresent);
        return {
            metadata: {
                eyebrow: stringOrUndefined(pageBody?.eyebrow) ?? 'Events',
                title: stringOrUndefined(pageBody?.title) ?? 'Upcoming Events',
                lead: stringOrUndefined(pageBody?.lead) ??
                    'These recurring services and public gatherings are currently drawn from the restored Zimbabwe schedule while the wider regional events system is being built out on the platform.',
            },
            items: eventItems.sort((left, right) => new Date(left.calculatedNextOccurrence).getTime() -
                new Date(right.calculatedNextOccurrence).getTime()),
        };
    }, () => (0, platform_store_1.getPublicEventsFeed)());
}
async function getPublicLiveWebcast() {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
        const page = await prisma.contentItem.findFirst({
            where: {
                slug: 'live-webcast',
                status: 'PUBLISHED',
                contentType: {
                    key: 'page',
                },
            },
            include: {
                versions: {
                    orderBy: {
                        versionNumber: 'desc',
                    },
                    take: 1,
                },
            },
        });
        const events = await prisma.contentItem.findMany({
            where: {
                status: 'PUBLISHED',
                contentType: {
                    key: 'event',
                },
            },
            orderBy: {
                title: 'asc',
            },
        });
        const latestBody = page?.versions[0]?.body;
        const bodyRecord = latestBody && typeof latestBody === 'object'
            ? latestBody
            : {};
        const fallbackWebcast = (0, platform_store_1.getPublicLiveWebcast)();
        const schedule = events.map(toOnlineEventView).filter(isPresent);
        return {
            metadata: {
                eyebrow: stringOrUndefined(bodyRecord.eyebrow) ?? 'Join Online',
                title: stringOrUndefined(bodyRecord.title) ?? page?.title ?? 'Live Webcast',
                lead: stringOrUndefined(bodyRecord.lead) ??
                    page?.summary ??
                    'Join the church online for worship, prayer, Bible teaching, and special services.',
            },
            featured: objectOrFallback(bodyRecord.featured, fallbackWebcast.featured),
            notes: arrayOfStringsOrFallback(bodyRecord.notes, fallbackWebcast.notes),
            platforms: arrayOrFallback(bodyRecord.platforms, fallbackWebcast.platforms),
            steps: arrayOfStringsOrFallback(bodyRecord.steps, fallbackWebcast.steps),
            support: arrayOrFallback(bodyRecord.support, fallbackWebcast.support),
            schedule,
        };
    }, () => (0, platform_store_1.getPublicLiveWebcast)());
}
function toSeedVisibility(value) {
    if (!value)
        return undefined;
    return value.toLowerCase();
}
function stringOrUndefined(value) {
    return typeof value === 'string' ? value : undefined;
}
function arrayOrUndefined(value) {
    return Array.isArray(value) ? value : undefined;
}
function toPublicEventView(item) {
    const metadata = item.metadata && typeof item.metadata === 'object'
        ? item.metadata
        : {};
    const recurrence = parseRecurrence(metadata.recurrence);
    const startDateTime = stringOrUndefined(metadata.startDateTime);
    const nextOccurrence = calculateNextOccurrence(recurrence, startDateTime, new Date());
    if (!nextOccurrence) {
        return null;
    }
    return {
        id: item.id,
        title: item.title,
        description: item.summary ?? null,
        recurrence,
        startDateTime: startDateTime ?? null,
        link: stringOrUndefined(metadata.link) ?? null,
        calculatedNextOccurrence: nextOccurrence.toISOString(),
    };
}
function toOnlineEventView(item) {
    const publicEvent = toPublicEventView({
        ...item,
        publishedAt: null,
        createdAt: new Date(),
    });
    if (!publicEvent?.link) {
        return null;
    }
    return {
        id: publicEvent.id,
        title: publicEvent.title,
        occurrenceLabel: formatOccurrenceLabel(publicEvent.calculatedNextOccurrence, publicEvent.recurrence ?? undefined),
        durationLabel: formatDuration(publicEvent.recurrence?.durationMinutes),
        joinUrl: publicEvent.link,
        description: stripJoinDetails(publicEvent.description),
        providerLabel: inferProviderLabel(publicEvent.link),
    };
}
function parseRecurrence(value) {
    if (!value || typeof value !== 'object') {
        return null;
    }
    const recurrence = value;
    const type = recurrence.type;
    const time = recurrence.time;
    if ((type !== 'daily' && type !== 'weekly') || typeof time !== 'string') {
        return null;
    }
    return {
        type,
        dayOfWeek: typeof recurrence.dayOfWeek === 'number' ? recurrence.dayOfWeek : undefined,
        time,
        durationMinutes: typeof recurrence.durationMinutes === 'number' ? recurrence.durationMinutes : undefined,
    };
}
function calculateNextOccurrence(recurrence, startDateTime, now) {
    if (recurrence?.time) {
        const [hour, minute] = recurrence.time.split(':').map(Number);
        if (Number.isNaN(hour) || Number.isNaN(minute)) {
            return null;
        }
        const nextDate = new Date(now);
        if (recurrence.type === 'weekly') {
            if (typeof recurrence.dayOfWeek !== 'number') {
                return null;
            }
            const currentDay = now.getDay();
            let daysUntilNext = recurrence.dayOfWeek - currentDay;
            if (daysUntilNext < 0) {
                daysUntilNext += 7;
            }
            nextDate.setDate(now.getDate() + daysUntilNext);
            nextDate.setHours(hour, minute, 0, 0);
            if (daysUntilNext === 0 && nextDate.getTime() < now.getTime()) {
                nextDate.setDate(nextDate.getDate() + 7);
            }
            return nextDate;
        }
        nextDate.setHours(hour, minute, 0, 0);
        if (nextDate.getTime() < now.getTime()) {
            nextDate.setDate(nextDate.getDate() + 1);
        }
        return nextDate;
    }
    if (!startDateTime) {
        return null;
    }
    const nextDate = new Date(startDateTime);
    if (Number.isNaN(nextDate.getTime()) || nextDate.getTime() < now.getTime()) {
        return null;
    }
    return nextDate;
}
function formatOccurrenceLabel(isoDateString, recurrence) {
    const date = new Date(isoDateString);
    if (Number.isNaN(date.getTime())) {
        return 'Date TBD';
    }
    const timeLabel = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
    if (recurrence?.type === 'weekly') {
        const weekdayLabel = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
        }).format(date);
        return `Every ${weekdayLabel} at ${timeLabel}`;
    }
    if (recurrence?.type === 'daily') {
        return `Daily at ${timeLabel}`;
    }
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}
function formatDuration(durationMinutes) {
    if (!durationMinutes || Number.isNaN(durationMinutes)) {
        return 'Duration varies';
    }
    if (durationMinutes < 60) {
        return `${durationMinutes} minutes`;
    }
    if (durationMinutes % 60 === 0) {
        const hours = durationMinutes / 60;
        return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours} hour${hours === 1 ? '' : 's'} ${minutes} minutes`;
}
function stripJoinDetails(description) {
    if (!description) {
        return null;
    }
    return description.replace(/\s*Join via Zoom:.*$/i, '').trim();
}
function inferProviderLabel(link) {
    if (link.includes('zoom.us')) {
        return 'Zoom';
    }
    if (link.includes('youtube')) {
        return 'YouTube';
    }
    if (link.includes('facebook')) {
        return 'Facebook';
    }
    return 'Online';
}
function objectOrFallback(value, fallback) {
    return value && typeof value === 'object' ? value : fallback;
}
function arrayOrFallback(value, fallback) {
    return Array.isArray(value) ? value : fallback;
}
function arrayOfStringsOrFallback(value, fallback) {
    if (!Array.isArray(value)) {
        return fallback;
    }
    return value.filter((item) => typeof item === 'string');
}
function isPresent(value) {
    return value !== null && value !== undefined;
}
//# sourceMappingURL=content-repository.js.map