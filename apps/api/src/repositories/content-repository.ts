import type { VisibilityScope } from '@afc-sear/types';
import {
  createContentItem as createSeedContentItem,
  getPublicEventsFeed as getSeedPublicEventsFeed,
  getPublicLiveWebcast as getSeedPublicLiveWebcast,
  getPublicNewsFeed as getSeedPublicNewsFeed,
  getStructuredPage as getSeedStructuredPage,
  getPublishedContentBySlug as getSeedPublishedContentBySlug,
  listContentItems as listSeedContentItems,
} from '../data/platform-store';
import type {
  CreateContentItemRequest,
  PublicEventView,
  PublicEventsFeedView,
  PublicLiveWebcastView,
  PublicNewsFeedView,
  StructuredPageView,
} from '../modules';
import { toContentItemView } from './mappers';
import { getPrismaClient, withRepositoryFallback } from './prisma';

export async function getPublishedContentBySlug(slug: string) {
  return withRepositoryFallback(
    async () => {
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
    },
    () => getSeedPublishedContentBySlug(slug)
  );
}

export async function listContentItemRecords(page = 1, pageSize = 50) {
  return withRepositoryFallback(
    async () => {
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
    },
    () => listSeedContentItems()
  );
}

export async function createContentItemRecord(input: CreateContentItemRequest) {
  return withRepositoryFallback(
    async () => {
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
          visibility: (input.visibility ?? 'PUBLIC') as PrismaVisibilityScope,
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
    },
    () =>
      createSeedContentItem({
        contentTypeKey: input.contentTypeKey,
        branchId: input.branchId,
        title: input.title,
        slug: input.slug,
        summary: input.summary,
        visibility: toSeedVisibility(input.visibility),
      })
  );
}

export async function getContentItemById(id: string) {
  return withRepositoryFallback(
    async () => {
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

      return content ? toContentItemView(content as any) : null;
    },
    async () => {
      throw new Error('getContentItemById not implemented in mock seed store');
    }
  );
}

export async function updateContentItem(id: string, input: {
  title?: string;
  summary?: string;
  body?: any;
  visibility?: VisibilityScope;
  status?: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
}) {
  return withRepositoryFallback(
    async () => {
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
          visibility: input.visibility ? (input.visibility.toUpperCase() as any) : undefined,
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

      return toContentItemView(updated as any);
    },
    async () => {
      throw new Error('updateContentItem not implemented in mock seed store');
    }
  );
}

export async function publishContentItem(id: string) {
  return updateContentItem(id, { status: 'PUBLISHED' });
}


export async function getStructuredPageBySlug(slug: string) {
  return withRepositoryFallback<StructuredPageView | null>(
    async () => {
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
      const bodyRecord = pageBody as Record<string, unknown>;

      return {
        eyebrow: stringOrUndefined(bodyRecord.eyebrow),
        title: stringOrUndefined(bodyRecord.title) ?? content.title,
        lead: stringOrUndefined(bodyRecord.lead) ?? content.summary ?? undefined,
        actions: arrayOrUndefined(bodyRecord.actions) as StructuredPageView['actions'],
        sections: arrayOrUndefined(bodyRecord.sections) as StructuredPageView['sections'],
      };
    },
    () => getSeedStructuredPage(slug)
  );
}

export async function getPublicNewsFeed() {
  return withRepositoryFallback<PublicNewsFeedView>(
    async () => {
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
          lead:
            'Recent announcements, ministry milestones, and verified public-site updates are published here so the website has a single trustworthy news stream while broader coverage is still being rebuilt carefully.',
        },
        items: items.map((item) => {
          const metadata =
            item.metadata && typeof item.metadata === 'object'
              ? (item.metadata as Record<string, unknown>)
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
    },
    () => getSeedPublicNewsFeed()
  );
}

export async function getPublicEventsFeed() {
  return withRepositoryFallback<PublicEventsFeedView>(
    async () => {
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
          lead:
            'These recurring services and public gatherings are currently drawn from the restored Zimbabwe schedule while the wider regional events system is being built out on the platform.',
        },
        items: eventItems.sort(
          (left, right) =>
            new Date(left.calculatedNextOccurrence).getTime() -
            new Date(right.calculatedNextOccurrence).getTime()
        ),
      };
    },
    () => getSeedPublicEventsFeed()
  );
}

export async function getPublicLiveWebcast() {
  return withRepositoryFallback<PublicLiveWebcastView>(
    async () => {
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
        ? (latestBody as Record<string, unknown>)
        : {};
      const fallbackWebcast = getSeedPublicLiveWebcast();
      const schedule = events.map(toOnlineEventView).filter(isPresent);

      return {
        metadata: {
          eyebrow: stringOrUndefined(bodyRecord.eyebrow) ?? 'Join Online',
          title: stringOrUndefined(bodyRecord.title) ?? page?.title ?? 'Live Webcast',
          lead:
            stringOrUndefined(bodyRecord.lead) ??
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
    },
    () => getSeedPublicLiveWebcast()
  );
}

type PrismaVisibilityScope = 'PUBLIC' | 'MEMBER' | 'BRANCH' | 'MINISTRY' | 'PRIVATE';

function toSeedVisibility(value?: CreateContentItemRequest['visibility']): VisibilityScope | undefined {
  if (!value) return undefined;
  return value.toLowerCase() as VisibilityScope;
}

function stringOrUndefined(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function arrayOrUndefined(value: unknown) {
  return Array.isArray(value) ? value : undefined;
}

type EventRecurrence = {
  type: 'daily' | 'weekly';
  dayOfWeek?: number;
  time: string;
  durationMinutes?: number;
};

function toPublicEventView(item: {
  id: string;
  title: string;
  summary: string | null;
  metadata: unknown;
  publishedAt: Date | null;
  createdAt: Date;
}) {
  const metadata =
    item.metadata && typeof item.metadata === 'object'
      ? (item.metadata as Record<string, unknown>)
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

function toOnlineEventView(item: {
  id: string;
  title: string;
  summary: string | null;
  metadata: unknown;
}) {
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
    occurrenceLabel: formatOccurrenceLabel(
      publicEvent.calculatedNextOccurrence,
      publicEvent.recurrence ?? undefined
    ),
    durationLabel: formatDuration(publicEvent.recurrence?.durationMinutes),
    joinUrl: publicEvent.link,
    description: stripJoinDetails(publicEvent.description),
    providerLabel: inferProviderLabel(publicEvent.link),
  };
}

function parseRecurrence(value: unknown): EventRecurrence | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const recurrence = value as Record<string, unknown>;
  const type = recurrence.type;
  const time = recurrence.time;

  if ((type !== 'daily' && type !== 'weekly') || typeof time !== 'string') {
    return null;
  }

  return {
    type,
    dayOfWeek: typeof recurrence.dayOfWeek === 'number' ? recurrence.dayOfWeek : undefined,
    time,
    durationMinutes:
      typeof recurrence.durationMinutes === 'number' ? recurrence.durationMinutes : undefined,
  };
}

function calculateNextOccurrence(
  recurrence: EventRecurrence | null,
  startDateTime: string | undefined,
  now: Date
) {
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

function formatOccurrenceLabel(
  isoDateString: string,
  recurrence?: EventRecurrence | null
) {
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

function formatDuration(durationMinutes?: number) {
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

function stripJoinDetails(description?: string | null) {
  if (!description) {
    return null;
  }

  return description.replace(/\s*Join via Zoom:.*$/i, '').trim();
}

function inferProviderLabel(link: string) {
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

function objectOrFallback<T>(value: unknown, fallback: T) {
  return value && typeof value === 'object' ? (value as T) : fallback;
}

function arrayOrFallback<T>(value: unknown, fallback: T[]) {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function arrayOfStringsOrFallback(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
