import type { ApiRouteContract, ServiceBoundary } from '../../contracts/common';

export interface ContentVersionView {
  id: string;
  versionNumber: number;
  createdAt: string;
  changeNote?: string | null;
}

export interface ContentItemView {
  id: string;
  contentTypeKey: string;
  branchId?: string | null;
  title: string;
  slug: string;
  summary?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'MEMBER' | 'BRANCH' | 'MINISTRY' | 'PRIVATE';
  publishedAt?: string | null;
  versions?: ContentVersionView[];
  body?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

export interface CreateContentItemRequest {
  contentTypeKey: string;
  branchId?: string;
  title: string;
  slug: string;
  summary?: string;
  visibility?: ContentItemView['visibility'];
}

export interface PublishContentRequest {
  publishAt?: string;
}

export interface StructuredPageView {
  eyebrow?: string;
  title: string;
  lead?: string;
  actions?: Array<{
    href: string;
    label: string;
    variant?: 'secondary';
  }>;
  sections?: Array<{
    heading?: string;
    paragraphs?: string[];
    list?: string[];
    quote?: {
      text: string;
      citation?: string;
    };
    cards?: Array<{
      title: string;
      description: string;
    }>;
  }>;
}

export interface PublicNewsItemView {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  category: string;
  location: string;
  status: string;
}

export interface PublicNewsFeedView {
  metadata: {
    eyebrow: string;
    title: string;
    lead: string;
  };
  items: PublicNewsItemView[];
}

export interface EventRecurrenceView {
  type: 'daily' | 'weekly';
  dayOfWeek?: number;
  time: string;
  durationMinutes?: number;
}

export interface PublicEventView {
  id: string;
  title: string;
  description?: string | null;
  recurrence?: EventRecurrenceView | null;
  startDateTime?: string | null;
  link?: string | null;
  calculatedNextOccurrence: string;
}

export interface PublicEventsFeedView {
  metadata: {
    eyebrow: string;
    title: string;
    lead: string;
  };
  items: PublicEventView[];
}

export interface LiveWebcastPlatformView {
  id: string;
  label: string;
  name: string;
  href: string;
  detail: string;
}

export interface LiveWebcastSupportView {
  id: string;
  label: string;
  value: string;
  href?: string;
}

export interface LiveWebcastFeaturedView {
  title: string;
  provider: string;
  streamUrl: string;
  accessLabel: string;
  meetingId: string;
  passcode: string;
  status: string;
  note: string;
}

export interface OnlineEventView {
  id: string;
  title: string;
  occurrenceLabel: string;
  durationLabel: string;
  joinUrl: string;
  description?: string | null;
  providerLabel: string;
}

export interface PublicLiveWebcastView {
  metadata: {
    eyebrow: string;
    title: string;
    lead: string;
  };
  featured: LiveWebcastFeaturedView;
  notes: string[];
  platforms: LiveWebcastPlatformView[];
  steps: string[];
  support: LiveWebcastSupportView[];
  schedule: OnlineEventView[];
}

export const contentServiceBoundary: ServiceBoundary = {
  domain: 'content',
  responsibilities: [
    'Manage content items, versions, approvals, and publishing',
    'Prepare frontend-ready page and listing payloads',
    'Own categories, tags, and media metadata',
  ],
  ownedTables: [
    'content_types',
    'content_items',
    'content_versions',
    'categories',
    'tags',
    'content_item_categories',
    'content_item_tags',
    'media_assets',
    'approval_requests',
  ],
  publishedEvents: ['content.created', 'content.submitted', 'content.published'],
  consumedEvents: ['identity.role_assigned'],
};

export const contentRoutes: ApiRouteContract[] = [
  {
    method: 'GET',
    path: '/api/v1/public/pages/:slug',
    summary: 'Return a published public content payload by slug',
    auth: 'public',
    responseType: 'ContentItemView',
  },
  {
    method: 'GET',
    path: '/api/v1/public/structured-pages/:slug',
    summary: 'Return a structured page payload shaped for the public website',
    auth: 'public',
    responseType: 'StructuredPageView',
  },
  {
    method: 'GET',
    path: '/api/v1/public/news',
    summary: 'Return the public news feed payload shaped for the website',
    auth: 'public',
    responseType: 'PublicNewsFeedView',
  },
  {
    method: 'GET',
    path: '/api/v1/public/events',
    summary: 'Return the public events feed payload shaped for the website',
    auth: 'public',
    responseType: 'PublicEventsFeedView',
  },
  {
    method: 'GET',
    path: '/api/v1/public/live-webcast',
    summary: 'Return the public live webcast payload shaped for the website',
    auth: 'public',
    responseType: 'PublicLiveWebcastView',
  },
  {
    method: 'GET',
    path: '/api/v1/admin/content-items',
    summary: 'List content items for editorial operations',
    auth: 'admin',
    responseType: 'ContentItemView[]',
  },
  {
    method: 'POST',
    path: '/api/v1/admin/content-items',
    summary: 'Create a content item shell',
    auth: 'admin',
    requestType: 'CreateContentItemRequest',
    responseType: 'ContentItemView',
  },
  {
    method: 'POST',
    path: '/api/v1/admin/content-items/:id/publish',
    summary: 'Publish a content item immediately or on a schedule',
    auth: 'admin',
    requestType: 'PublishContentRequest',
    responseType: 'ContentItemView',
  },
];
