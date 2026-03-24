import { createContentItem as createSeedContentItem, getPublicEventsFeed as getSeedPublicEventsFeed, getPublicLiveWebcast as getSeedPublicLiveWebcast, getPublicNewsFeed as getSeedPublicNewsFeed, getStructuredPage as getSeedStructuredPage, getPublishedContentBySlug as getSeedPublishedContentBySlug, listContentItems as listSeedContentItems, } from '../data/platform-store';
import { toContentItemView } from './mappers';
import { getPrismaClient, withRepositoryFallback } from './prisma';
export async function getPublishedContentBySlug(slug) {
    return withRepositoryFallback(async () => {
        const prisma = getPrismaClient();
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
        return content ? toContentItemView(content) : null;
    }, () => getSeedPublishedContentBySlug(slug));
}
export async function listContentItemRecords(page = 1, pageSize = 50) {
    return withRepositoryFallback(async () => {
        const prisma = getPrismaClient();
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
        return items.map(toContentItemView);
    }, () => listSeedContentItems());
}
export async function createContentItemRecord(input) {
    return withRepositoryFallback(async () => {
        const prisma = getPrismaClient();
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
        return toContentItemView(created);
    }, () => createSeedContentItem({
        contentTypeKey: input.contentTypeKey,
        branchId: input.branchId,
        title: input.title,
        slug: input.slug,
        summary: input.summary,
        visibility: toSeedVisibility(input.visibility),
    }));
}
export async function getContentItemById(id) {
    return withRepositoryFallback(async () => {
        const prisma = getPrismaClient();
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
        return content ? toContentItemView(content) : null;
    }, async () => {
        throw new Error('getContentItemById not implemented in mock seed store');
    });
}
export async function updateContentItem(id, input) {
    return withRepositoryFallback(async () => {
        const prisma = getPrismaClient();
        const current = await prisma.contentItem.findUniqueOrThrow({
            where: { id },
            include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } }
        });
        const updated = await prisma.contentItem.update({
            where: { id },
            data: {
                title: input.title ?? undefined,
                summary: input.summary ?? undefined,
                visibility: input.visibility ? input.visibility.toUpperCase() : undefined,
                status: input.status ?? undefined,
                publishedAt: input.status === 'PUBLISHED' ? new Date() : undefined,
            },
            include: {
                contentType: { select: { key: true } },
                versions: { orderBy: { versionNumber: 'desc' }, take: 3 }
            }
        });
        // If body is provided, create a new version
        if (input.body) {
            const nextVersionNumber = (current.versions[0]?.versionNumber ?? 0) + 1;
            await prisma.contentVersion.create({
                data: {
                    contentItemId: id,
                    versionNumber: nextVersionNumber,
                    body: input.body,
                }
            });
        }
        return toContentItemView(updated);
    }, async () => {
        throw new Error('updateContentItem not implemented in mock seed store');
    });
}
export async function publishContentItem(id) {
    return updateContentItem(id, { status: 'PUBLISHED' });
}
export async function getStructuredPageBySlug(slug) {
    return withRepositoryFallback(async () => {
        const prisma = getPrismaClient();
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
    }, () => getSeedStructuredPage(slug));
}
export async function getPublicNewsFeed() {
    return withRepositoryFallback(async () => {
        const prisma = getPrismaClient();
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
                eyebrow: 'Updates',
                title: 'Latest News',
                lead: 'Recent announcements, ministry milestones, and verified public-site updates are published here so the website has a single trustworthy news stream while broader coverage is still being rebuilt carefully.',
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
    }, () => getSeedPublicNewsFeed());
}
export async function getPublicEventsFeed() {
    return withRepositoryFallback(async () => {
        const prisma = getPrismaClient();
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
                eyebrow: 'Events',
                title: 'Upcoming Events',
                lead: 'These recurring services and public gatherings are currently drawn from the restored Zimbabwe schedule while the wider regional events system is being built out on the platform.',
            },
            items: eventItems.sort((left, right) => new Date(left.calculatedNextOccurrence).getTime() -
                new Date(right.calculatedNextOccurrence).getTime()),
        };
    }, () => getSeedPublicEventsFeed());
}
export async function getPublicLiveWebcast() {
    return withRepositoryFallback(async () => {
        const prisma = getPrismaClient();
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
        const fallbackWebcast = getSeedPublicLiveWebcast();
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
    }, () => getSeedPublicLiveWebcast());
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