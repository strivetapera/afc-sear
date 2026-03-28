import { randomUUID } from 'node:crypto';
import type { VisibilityScope } from '@afc-sear/types';
// @ts-expect-error shared seed/import data is authored in JavaScript for reuse across packages
import { corePageImports } from '../../../../data/corePageImports.js';
import type {
  AuthenticatedUserView,
  BranchView,
  ContentItemView,
  HouseholdView,
  LocationsDirectoryView,
  PersonView,
  PublicEventsFeedView,
  PublicLiveWebcastView,
  PublicNewsFeedView,
  SessionView,
  SignInRequest,
  StructuredPageView,
} from '../modules';
import { fallbackLocationsDirectory } from './locations-fallback';

type CorePageImport = {
  slug: string;
  title: string;
  summary: string;
  body: Record<string, unknown>;
};

const branchId = 'branch-harare-001';
const userId = 'user-admin-001';
const personId = 'person-admin-001';

const branchDirectory: BranchView[] = [
  {
    id: branchId,
    countryId: 'country-zimbabwe-001',
    name: 'Harare',
    slug: 'harare',
    type: 'local-church',
    email: 'harare@apostolicfaith.example',
    phone: '+263771400856',
    city: 'Harare',
    countryName: 'Zimbabwe',
    ministryCount: 0,
    isPublic: true,
  },
];

const people: PersonView[] = [
  {
    id: personId,
    firstName: 'Platform',
    lastName: 'Administrator',
    preferredName: 'Admin',
    email: 'admin@apostolicfaith.example',
    phone: '+263771400856',
    branchId,
    lifecycleStage: 'STAFF',
  },
];

const households: HouseholdView[] = [
  {
    id: 'household-admin-001',
    branchId,
    displayName: 'Administrator Household',
    primaryContactPersonId: personId,
    members: [
      {
        personId,
        fullName: 'Platform Administrator',
        relationshipType: 'SELF',
        isPrimaryContact: true,
      },
    ],
  },
];

const baseUser: AuthenticatedUserView = {
  id: userId,
  email: 'admin@apostolicfaith.example',
  phone: '+263771400856',
  status: 'ACTIVE',
  defaultBranchId: branchId,
  roleKeys: ['super_admin'],
  branchScopeIds: [branchId],
};

const importedPages = corePageImports as CorePageImport[];

const contentItems: ContentItemView[] = [
  ...importedPages.map((page: CorePageImport, index: number) => ({
    id: `content-page-${index + 1}`,
    contentTypeKey: 'page',
    branchId,
    title: page.title,
    slug: page.slug,
    summary: page.summary,
    body: page.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    publishedAt: new Date().toISOString(),
    versions: [
      {
        id: `content-page-version-${index + 1}`,
        versionNumber: 1,
        createdAt: new Date().toISOString(),
        changeNote: 'Imported core content',
      },
    ],
  })),
  {
    id: 'content-news-001',
    contentTypeKey: 'news',
    branchId,
    title: 'Leadership Conference Planning Opens For 2026',
    slug: 'leadership-conference-2026',
    summary: 'Seeded news item from the API scaffold store.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    publishedAt: new Date().toISOString(),
  },
];

const structuredPages: Record<string, StructuredPageView> = Object.fromEntries(
  importedPages
    .filter((page: CorePageImport) => page.body?.title && page.body?.lead)
    .map((page: CorePageImport) => [page.slug, page.body as unknown as StructuredPageView])
);

const newsPageBody = importedPages.find((page: CorePageImport) => page.slug === 'news')?.body as StructuredPageView | undefined;
const eventsPageBody = importedPages.find((page: CorePageImport) => page.slug === 'events')?.body as StructuredPageView | undefined;

const publicNewsFeed: PublicNewsFeedView = {
  metadata: {
    eyebrow: newsPageBody?.eyebrow ?? 'Updates',
    title: newsPageBody?.title ?? 'Latest News',
    lead:
      newsPageBody?.lead ??
      'Recent announcements, ministry milestones, and verified public-site updates are published here so the website has a single trustworthy news stream while broader coverage is still being rebuilt carefully.',
  },
  items: [
    {
      id: 'leadership-conference-2026',
      title: 'Leadership Conference Planning Opens For 2026',
      summary:
        'Regional leaders are opening preparation for the next leadership conference, with sessions focused on discipleship, pastoral care, youth ministry, and strengthening local church administration.',
      publishedAt: '2026-03-12',
      category: 'Conference',
      location: 'Public Site Update',
      status: 'Registration details coming soon',
    },
    {
      id: 'community-outreach-report',
      title: 'Community Outreach Weekend Reaches New Families',
      summary:
        'Local congregations reported strong participation in outreach visits, prayer support, and children ministry activities, with several first-time visitors returning for Sunday worship.',
      publishedAt: '2026-02-28',
      category: 'Outreach',
      location: 'Church Highlights',
      status: 'Follow-up teams active',
    },
  ],
};

const publicEventsFeed: PublicEventsFeedView = {
  metadata: {
    eyebrow: eventsPageBody?.eyebrow ?? 'Events',
    title: eventsPageBody?.title ?? 'Upcoming Events',
    lead:
      eventsPageBody?.lead ??
      'These recurring services and public gatherings are currently drawn from the restored Zimbabwe schedule while the wider regional events system is being built out on the platform.',
  },
  items: [
    {
      id: 'daily-prayer',
      title: 'Morning Prayer (Online)',
      description:
        'Start your day with prayer and devotion through the restored Zimbabwe webcast room.',
      recurrence: {
        type: 'daily',
        time: '05:00',
        durationMinutes: 60,
      },
      link: 'https://apostolicfaithsa-org.zoom.us/j/85088056383?pwd=NHQ2BstjEsp09UkwVJqw1IjippXko7.1',
      calculatedNextOccurrence: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: 'sun-devotional',
      title: 'Sunday Devotional Service',
      description:
        'Watch through the restored YouTube channel when this service is streamed online.',
      recurrence: {
        type: 'weekly',
        dayOfWeek: 0,
        time: '10:30',
        durationMinutes: 120,
      },
      link: 'https://www.youtube.com/channel/UCVurrGprkJIr7lTQH6zT1hg',
      calculatedNextOccurrence: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    },
  ],
};

const publicLiveWebcastView: PublicLiveWebcastView = {
  metadata: {
    eyebrow: 'Join Online',
    title: 'Live Webcast',
    lead:
      'Gather online for worship, prayer, Bible teaching, and special services through the restored Zimbabwe webcast details now carried into the platform.',
  },
  featured: {
    title: 'Zimbabwe Online Service Room',
    provider: 'Zoom',
    streamUrl:
      'https://apostolicfaithsa-org.zoom.us/j/85088056383?pwd=NHQ2BstjEsp09UkwVJqw1IjippXko7.1',
    accessLabel: 'Open Live Meeting',
    meetingId: '850 8805 6383',
    passcode: '111',
    status: 'Legacy verified webcast access restored',
    note:
      'This Zoom room comes directly from the archived Zimbabwe schedule page and is the clearest verified meeting room carried over into the new platform.',
  },
  notes: [
    'The platform links above come from the archived Zimbabwe schedule page, while the regular schedule below comes from the shared event feed.',
    'Schedules for camp meetings to be held in other countries will be displayed closer to the dates.',
  ],
  platforms: [
    {
      id: 'zoom',
      label: 'Zoom',
      name: 'Online Service Room',
      href: 'https://apostolicfaithsa-org.zoom.us/j/85088056383?pwd=NHQ2BstjEsp09UkwVJqw1IjippXko7.1',
      detail: 'Meeting ID 850 8805 6383 | Passcode 111',
    },
    {
      id: 'youtube',
      label: 'YouTube',
      name: 'Apostolic Faith Church YouTube',
      href: 'https://www.youtube.com/channel/UCVurrGprkJIr7lTQH6zT1hg',
      detail: 'Use this channel for livestreams and replayed services.',
    },
    {
      id: 'facebook',
      label: 'Facebook',
      name: 'Apostolic Faith Church Zimbabwe Facebook',
      href: 'https://www.facebook.com/ApostolicFaithPortlandZW',
      detail: 'The previous site linked this page for live and follow-up streaming access.',
    },
  ],
  steps: [
    'Open the Zoom meeting link a few minutes before service starts, or use the meeting ID and passcode if your device does not open the link directly.',
    'For services streamed through social media, use the YouTube or Facebook channel links below and look for the current live broadcast.',
    'Keep your Bible and notebook ready so you can participate fully during the service.',
  ],
  support: [
    {
      id: 'prayer-whatsapp-1',
      label: 'Prayer Requests WhatsApp',
      value: '+263 771 400 856',
      href: 'https://wa.me/263771400856',
    },
    {
      id: 'regional-email',
      label: 'Regional Email',
      value: 'contact@apostolicfaith-sear.org',
      href: 'mailto:contact@apostolicfaith-sear.org',
    },
  ],
  schedule: [
    {
      id: 'daily-prayer',
      title: 'Morning Prayer (Online)',
      occurrenceLabel: 'Daily at 5:00 AM',
      durationLabel: '1 hour',
      joinUrl:
        'https://apostolicfaithsa-org.zoom.us/j/85088056383?pwd=NHQ2BstjEsp09UkwVJqw1IjippXko7.1',
      description:
        'Start your day with prayer and devotion through the restored Zimbabwe webcast room.',
      providerLabel: 'Zoom',
    },
    {
      id: 'sun-devotional',
      title: 'Sunday Devotional Service',
      occurrenceLabel: 'Every Sunday at 10:30 AM',
      durationLabel: '2 hours',
      joinUrl: 'https://www.youtube.com/channel/UCVurrGprkJIr7lTQH6zT1hg',
      description:
        'Watch through the restored YouTube channel when this service is streamed online.',
      providerLabel: 'YouTube',
    },
  ],
};

export function signIn(request: SignInRequest) {
  const normalizedLogin = request.login.trim().toLowerCase();
  const allowedLogins = [baseUser.email.toLowerCase(), baseUser.phone];
  const passwordMatches = request.password === 'changeme-admin';

  if (!allowedLogins.includes(normalizedLogin) || !passwordMatches) {
    return null;
  }

  const session: SessionView = {
    id: randomUUID(),
    deviceLabel: 'Seeded local session',
    ipAddress: '127.0.0.1',
    userAgent: 'manual-local-client',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
  };

  return {
    user: baseUser,
    session,
    requiresMfa: false,
  };
}

export function getCurrentUser() {
  return baseUser;
}

export function listBranches() {
  return branchDirectory;
}

export function listPeople() {
  return people;
}

export function upsertPerson(input: Omit<PersonView, 'id'> & { id?: string }) {
  const existingIndex = input.id ? people.findIndex((item) => item.id === input.id) : -1;

  if (existingIndex >= 0) {
    people[existingIndex] = { ...people[existingIndex], ...input, id: people[existingIndex].id };
    return people[existingIndex];
  }

  const created: PersonView = {
    id: randomUUID(),
    firstName: input.firstName,
    lastName: input.lastName,
    preferredName: input.preferredName ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    branchId: input.branchId ?? null,
    lifecycleStage: input.lifecycleStage,
  };

  people.push(created);
  return created;
}

export function getHouseholdForCurrentUser() {
  return households[0];
}

export function getPublishedContentBySlug(slug: string) {
  return contentItems.find((item) => item.slug === slug && item.status === 'PUBLISHED') ?? null;
}

export function listContentItems() {
  return contentItems;
}

export function getStructuredPage(slug: string) {
  return structuredPages[slug] ?? null;
}

export function getPublicNewsFeed() {
  return publicNewsFeed;
}

export function getPublicEventsFeed() {
  return publicEventsFeed;
}

export function getPublicLiveWebcast() {
  return publicLiveWebcastView;
}

export function getLocationsDirectory(): LocationsDirectoryView {
  return fallbackLocationsDirectory;
}

export function createContentItem(input: {
  contentTypeKey: string;
  branchId?: string;
  title: string;
  slug: string;
  summary?: string;
  visibility?: VisibilityScope;
}) {
  const created: ContentItemView = {
    id: randomUUID(),
    contentTypeKey: input.contentTypeKey,
    branchId: input.branchId ?? null,
    title: input.title,
    slug: input.slug,
    summary: input.summary ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'DRAFT',
    visibility: input.visibility ? input.visibility.toUpperCase() as ContentItemView['visibility'] : 'PUBLIC',
    publishedAt: null,
    versions: [],
  };

  contentItems.push(created);
  return created;
}
