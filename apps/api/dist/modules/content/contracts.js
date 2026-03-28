"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentRoutes = exports.contentServiceBoundary = void 0;
exports.contentServiceBoundary = {
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
exports.contentRoutes = [
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
//# sourceMappingURL=contracts.js.map