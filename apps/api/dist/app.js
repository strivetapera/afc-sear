"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const auth_1 = require("@afc-sear/auth");
const auth_2 = __importDefault(require("./plugins/auth"));
const prisma_1 = require("./repositories/prisma");
const content_repository_1 = require("./repositories/content-repository");
const identity_repository_1 = require("./repositories/identity-repository");
const organization_repository_1 = require("./repositories/organization-repository");
const search_repository_1 = require("./repositories/search-repository");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const people_repository_1 = require("./repositories/people-repository");
const event_repository_1 = require("./repositories/event-repository");
const communications_repository_1 = require("./repositories/communications-repository");
const finances_repository_1 = require("./repositories/finances-repository");
const audit_1 = require("./repositories/audit");
const schemas = __importStar(require("./schemas"));
/**
 * Helper to extract pagination from query params
 */
function getPagination(query) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(query.pageSize ?? '50', 10)));
    return { page, pageSize };
}
const ADMIN_ROLE = 'admin';
function createApp() {
    const app = (0, fastify_1.default)({
        logger: true,
    });
    app.register(cors_1.default, {
        origin: [
            process.env.ADMIN_URL || 'http://localhost:3001',
            process.env.WEB_URL || 'http://localhost:3000',
            process.env.PORTAL_URL || 'http://localhost:3002',
            'http://localhost:3001',
            'http://localhost:3000',
            'http://localhost:3002',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3002',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    const prisma = (0, prisma_1.getPrismaClient)();
    const auth = (0, auth_1.auth)(prisma);
    const searchRepository = new search_repository_1.SearchRepository(prisma);
    const redisUrl = process.env.REDIS_URL;
    let queueConnection = null;
    let jobQueue = null;
    if (redisUrl) {
        queueConnection = new ioredis_1.default(redisUrl, {
            maxRetriesPerRequest: null,
            lazyConnect: true,
            enableOfflineQueue: false,
        });
        queueConnection.on('error', (error) => {
            app.log.warn({ err: error }, 'Redis queue connection error');
        });
        jobQueue = new bullmq_1.Queue('platform-job-queue', {
            connection: queueConnection,
        });
        void queueConnection.connect().then(() => {
            app.log.info('Redis-backed job queue connected');
        }).catch(async (error) => {
            app.log.warn({ err: error }, 'Redis unavailable; background jobs disabled');
            await jobQueue?.close().catch(() => undefined);
            queueConnection?.disconnect();
            jobQueue = null;
            queueConnection = null;
        });
    }
    else {
        app.log.warn('REDIS_URL not set; background jobs are disabled');
    }
    app.addHook('onClose', async () => {
        await jobQueue?.close().catch(() => undefined);
        queueConnection?.disconnect();
    });
    app.register(auth_2.default, {
        auth,
    });
    app.after(() => {
        // ─── Health & OpenAPI ────────────────────────────────────────────────────
        app.get('/api/v1/health-check', async () => ({
            status: 'ok',
            timestamp: new Date().toISOString(),
        }));
        app.get('/health', async () => ({
            status: 'ok',
            service: '@afc-sear/api',
            timestamp: new Date().toISOString(),
        }));
        app.get('/openapi.yaml', async (_request, reply) => {
            const specPath = (0, node_path_1.join)(process.cwd(), 'openapi', 'openapi.yaml');
            const spec = await (0, promises_1.readFile)(specPath, 'utf8');
            reply.type('application/yaml');
            return spec;
        });
        // ─── Identity ────────────────────────────────────────────────────────────
        // ─── Identity (Better Auth) ─────────────────────────────────────────────
        app.all('/api/v1/auth/*', async (request, reply) => {
            // Create a full URL for the Web Request
            const protocol = request.protocol;
            const host = request.hostname;
            const url = `${protocol}://${host}${request.url}`;
            const webRequest = new Request(url, {
                method: request.method,
                headers: new Headers(request.headers),
                // Fastify already parsed the body, so we re-stringify it for the Web Request
                body: request.body ? JSON.stringify(request.body) : undefined,
            });
            try {
                const res = await auth.handler(webRequest);
                // Map Web Response headers back to Fastify
                // Specific handling for set-cookie to support multiple cookies
                for (const [key, value] of res.headers.entries()) {
                    if (key.toLowerCase() === 'set-cookie') {
                        const cookies = res.headers.getSetCookie?.() || [value];
                        for (const cookie of cookies) {
                            reply.header('set-cookie', cookie);
                        }
                    }
                    else {
                        reply.header(key, value);
                    }
                }
                reply.status(res.status);
                // Return the response body as a buffer to handle any content type safely
                const buffer = await res.arrayBuffer();
                return reply.send(Buffer.from(buffer));
            }
            catch (error) {
                request.log.error({ err: error }, 'Better Auth handler error');
                reply.status(500).send({ error: 'internal_error', message: 'Auth handler failed' });
            }
        });
        app.get('/api/v1/me', { preHandler: [app.authenticate] }, async (request) => {
            const result = await (0, identity_repository_1.getCurrentUserProfile)(request.user?.id ?? '');
            return { data: result.data, meta: { source: result.source } };
        });
        app.patch('/api/v1/me/profile', {
            preHandler: [app.authenticate],
            schema: { body: schemas.UpdateProfileSchema },
        }, async (request) => {
            const userId = request.user?.id ?? '';
            const body = request.body;
            const result = await (0, people_repository_1.updateMemberProfile)(userId, body);
            return { data: result };
        });
        app.get('/api/v1/me/household', { preHandler: [app.authenticate] }, async () => {
            const result = await (0, people_repository_1.getCurrentHousehold)();
            return { data: result.data, meta: { source: result.source } };
        });
        app.get('/api/v1/me/registrations', { preHandler: [app.authenticate] }, async (request) => {
            const userId = request.user?.id ?? '';
            const items = await (0, people_repository_1.getMemberRegistrations)(userId);
            return { data: items, meta: { count: items.length } };
        });
        app.get('/api/v1/me/giving', { preHandler: [app.authenticate] }, async (request) => {
            const userId = request.user?.id ?? '';
            const items = await (0, people_repository_1.getMemberGiving)(userId);
            return { data: items, meta: { count: items.length } };
        });
        app.get('/api/v1/me/announcements', { preHandler: [app.authenticate] }, async (request) => {
            const userId = request.user?.id ?? '';
            const items = await (0, people_repository_1.getMemberAnnouncements)(userId);
            return { data: items, meta: { count: items.length } };
        });
        app.post('/api/v1/me/prayer-requests', {
            preHandler: [app.authenticate],
            schema: { body: schemas.PrayerRequestSchema },
        }, async (request, reply) => {
            const userId = request.user?.id ?? '';
            const body = request.body;
            const item = await (0, people_repository_1.createPrayerRequest)(userId, body);
            reply.code(201);
            return { data: item };
        });
        app.post('/api/v1/admin/identity/assign-role', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request) => {
            const result = await (0, identity_repository_1.assignRole)(request.body);
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'ASSIGN_ROLE',
                domain: 'identity',
                entityType: 'user',
                entityId: request.body.userId,
                after: { roleKey: request.body.roleKey },
                ipAddress: request.ip,
            });
            return { data: result.data, meta: { source: result.source } };
        });
        // ─── Users Management ────────────────────────────────────────────────────
        app.get('/api/v1/admin/users', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request) => {
            const { page, pageSize } = getPagination(request.query);
            const result = await (0, identity_repository_1.listAdminUsers)(page, pageSize);
            return { data: result.data, meta: { page, pageSize, count: result.count } };
        });
        // ─── Organization ────────────────────────────────────────────────────────
        app.get('/api/v1/public/branches', async () => {
            const result = await (0, organization_repository_1.listPublicBranches)();
            return { data: result.data, meta: { source: result.source, count: result.data.length } };
        });
        app.get('/api/v1/public/locations-directory', async () => {
            const result = await (0, organization_repository_1.getLocationsDirectory)();
            return { data: result.data, meta: { source: result.source } };
        });
        app.get('/api/v1/admin/branches', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async () => {
            const result = await (0, organization_repository_1.listAdminBranches)();
            return { data: result.data, meta: { source: result.source, count: result.data.length } };
        });
        app.post('/api/v1/admin/branches', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request, reply) => {
            const result = await (0, organization_repository_1.createBranch)(request.body);
            reply.code(201);
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'CREATE_BRANCH',
                domain: 'organization',
                entityType: 'branch',
                entityId: result.data?.id,
                after: result.data,
                ipAddress: request.ip,
            });
            return { data: result.data, meta: { source: result.source } };
        });
        app.get('/api/v1/admin/ministries', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async () => {
            const result = await (0, organization_repository_1.listMinistries)();
            return { data: result.data, meta: { source: result.source, count: result.data.length } };
        });
        // ─── People ──────────────────────────────────────────────────────────────
        app.get('/api/v1/admin/people', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request) => {
            const { page, pageSize } = getPagination(request.query);
            const result = await (0, people_repository_1.listPeopleRecords)(page, pageSize);
            return { data: result.data, meta: { source: result.source, page, pageSize } };
        });
        app.post('/api/v1/admin/people', {
            preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
            schema: { body: schemas.UpsertPersonSchema },
        }, async (request) => {
            const result = await (0, people_repository_1.upsertPersonRecord)(request.body);
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'UPSERT_PERSON',
                domain: 'people',
                entityType: 'person',
                entityId: result.data?.id,
                after: result.data,
                ipAddress: request.ip,
            });
            return { data: result.data, meta: { source: result.source } };
        });
        // ─── Content ─────────────────────────────────────────────────────────────
        app.get('/api/v1/public/pages/:slug', async (request, reply) => {
            const result = await (0, content_repository_1.getPublishedContentBySlug)(request.params.slug);
            if (!result.data) {
                reply.code(404);
                return { error: 'not_found', message: `No published content was found for slug "${request.params.slug}".` };
            }
            return { data: result.data, meta: { source: result.source } };
        });
        app.get('/api/v1/public/structured-pages/:slug', async (request, reply) => {
            const result = await (0, content_repository_1.getStructuredPageBySlug)(request.params.slug);
            if (!result.data) {
                reply.code(404);
                return { error: 'not_found', message: `No structured page was found for slug "${request.params.slug}".` };
            }
            return { data: result.data, meta: { source: result.source } };
        });
        app.get('/api/v1/public/news', async () => {
            const result = await (0, content_repository_1.getPublicNewsFeed)();
            return { data: result.data, meta: { source: result.source, count: result.data.items.length } };
        });
        app.get('/api/v1/public/events', async () => {
            const result = await (0, content_repository_1.getPublicEventsFeed)();
            return { data: result.data, meta: { source: result.source, count: result.data.items.length } };
        });
        app.get('/api/v1/public/live-webcast', async () => {
            const result = await (0, content_repository_1.getPublicLiveWebcast)();
            return { data: result.data, meta: { source: result.source, count: result.data.schedule.length } };
        });
        app.get('/api/v1/public/lessons', async () => {
            const result = await (0, content_repository_1.listPublishedLessons)();
            return { data: result.data, meta: { source: result.source, count: result.data.length } };
        });
        app.get('/api/v1/admin/content-items', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request) => {
            const { page, pageSize } = getPagination(request.query);
            const result = await (0, content_repository_1.listContentItemRecords)(page, pageSize);
            return { data: result.data, meta: { source: result.source, page, pageSize } };
        });
        app.post('/api/v1/admin/content-items', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request, reply) => {
            const result = await (0, content_repository_1.createContentItemRecord)({
                contentTypeKey: request.body.contentTypeKey,
                branchId: request.body.branchId,
                title: request.body.title,
                slug: request.body.slug,
                summary: request.body.summary,
                visibility: request.body.visibility,
            });
            reply.code(201);
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'CREATE_CONTENT_ITEM',
                domain: 'content',
                entityType: 'content_item',
                entityId: result.data?.id,
                after: result.data,
                ipAddress: request.ip,
            });
            return { data: result.data, meta: { source: result.source } };
        });
        app.get('/api/v1/admin/content-items/:id', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request, reply) => {
            const result = await (0, content_repository_1.getContentItemById)(request.params.id);
            if (!result.data) {
                reply.code(404);
                return { error: 'not_found' };
            }
            return result;
        });
        app.patch('/api/v1/admin/content-items/:id', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request) => {
            const before = await (0, content_repository_1.getContentItemById)(request.params.id);
            const result = await (0, content_repository_1.updateContentItem)(request.params.id, request.body);
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'UPDATE_CONTENT_ITEM',
                domain: 'content',
                entityType: 'content_item',
                entityId: request.params.id,
                before: before.data ?? null,
                after: result?.data ?? null,
                ipAddress: request.ip,
            });
            return result;
        });
        app.post('/api/v1/admin/content-items/:id/publish', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request) => {
            const result = await (0, content_repository_1.publishContentItem)(request.params.id);
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'PUBLISH_CONTENT_ITEM',
                domain: 'content',
                entityType: 'content_item',
                entityId: request.params.id,
                ipAddress: request.ip,
            });
            return result;
        });
        app.delete('/api/v1/admin/content-items/:id', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request) => {
            const before = await (0, content_repository_1.getContentItemById)(request.params.id);
            const result = await (0, content_repository_1.deleteContentItem)(request.params.id);
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'DELETE_CONTENT_ITEM',
                domain: 'content',
                entityType: 'content_item',
                entityId: request.params.id,
                before: before.data ?? null,
                ipAddress: request.ip,
            });
            return result;
        });
        // ─── Events ──────────────────────────────────────────────────────────────
        app.get('/api/v1/public/events/list', async () => {
            const events = await (0, event_repository_1.listPublicEvents)();
            return { data: events };
        });
        app.get('/api/v1/public/events/:slug', async (request, reply) => {
            const event = await (0, event_repository_1.getEventBySlug)(request.params.slug);
            if (!event) {
                reply.code(404);
                return { error: 'not_found' };
            }
            return { data: event };
        });
        app.post('/api/v1/public/events/:slug/register', async (request) => {
            return (0, event_repository_1.registerForEvent)(request.params.slug, request.body);
        });
        app.get('/api/v1/admin/events', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async () => {
            const events = await (0, event_repository_1.listAdminEvents)();
            return { data: events };
        });
        app.post('/api/v1/admin/events', {
            preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
            schema: { body: schemas.CreateEventSchema },
        }, async (request, reply) => {
            const body = request.body;
            const event = await (0, event_repository_1.createEvent)(body);
            reply.code(201);
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'CREATE_EVENT',
                domain: 'events',
                entityType: 'event',
                entityId: event?.id,
                after: event,
                ipAddress: request.ip,
            });
            return { data: event };
        });
        app.patch('/api/v1/admin/events/:id', {
            preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
            schema: { body: schemas.UpdateEventSchema },
        }, async (request) => {
            const body = request.body;
            const event = await (0, event_repository_1.updateEvent)(request.params.id, body);
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'UPDATE_EVENT',
                domain: 'events',
                entityType: 'event',
                entityId: request.params.id,
                after: event,
                ipAddress: request.ip,
            });
            return { data: event };
        });
        app.post('/api/v1/admin/events/:id/schedules', {
            preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
            schema: { body: schemas.AddEventScheduleSchema },
        }, async (request, reply) => {
            const body = request.body;
            const schedule = await (0, event_repository_1.addSchedule)(request.params.id, body);
            reply.code(201);
            return { data: schedule };
        });
        app.post('/api/v1/admin/events/:id/ticket-types', {
            preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
            schema: { body: schemas.AddTicketTypeSchema },
        }, async (request, reply) => {
            const body = request.body;
            const ticketType = await (0, event_repository_1.addTicketType)(request.params.id, body);
            reply.code(201);
            return { data: ticketType };
        });
        app.get('/api/v1/admin/events/:id/registrations', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request) => {
            return { data: await (0, event_repository_1.listEventRegistrations)(request.params.id) };
        });
        app.post('/api/v1/admin/events/:id/check-in', {
            preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
            schema: { body: schemas.CheckInSchema },
        }, async (request) => {
            const actorId = request.user?.id;
            const result = await (0, event_repository_1.recordCheckIn)(request.body.attendeeId, actorId);
            await (0, audit_1.writeAuditLog)({
                actorUserId: actorId,
                action: 'CHECK_IN_ATTENDEE',
                domain: 'events',
                entityType: 'registration_attendee',
                entityId: request.body.attendeeId,
                after: result,
                ipAddress: request.ip,
            });
            return { data: result };
        });
        // ─── Communications ────────────────────────────────────────────────────
        app.get('/api/v1/public/announcements', async () => {
            const items = await (0, communications_repository_1.listPublicAnnouncements)();
            return { data: items, meta: { count: items.length } };
        });
        app.get('/api/v1/admin/announcements', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async () => {
            const items = await (0, communications_repository_1.listAnnouncements)();
            return { data: items, meta: { count: items.length } };
        });
        app.post('/api/v1/admin/announcements', {
            preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
            schema: { body: schemas.CreateAnnouncementSchema },
        }, async (request, reply) => {
            const body = request.body;
            const item = await (0, communications_repository_1.createAnnouncement)(body);
            reply.code(201);
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'CREATE_ANNOUNCEMENT',
                domain: 'communications',
                entityType: 'announcement',
                entityId: item?.id,
                after: item,
                ipAddress: request.ip,
            });
            return { data: item };
        });
        app.patch('/api/v1/admin/announcements/:id', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request) => {
            const body = request.body;
            const item = await (0, communications_repository_1.updateAnnouncement)(request.params.id, body);
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'UPDATE_ANNOUNCEMENT',
                domain: 'communications',
                entityType: 'announcement',
                entityId: request.params.id,
                after: item,
                ipAddress: request.ip,
            });
            return { data: item };
        });
        app.get('/api/v1/admin/campaigns', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async () => {
            const items = await (0, communications_repository_1.listCampaigns)();
            return { data: items, meta: { count: items.length } };
        });
        app.post('/api/v1/admin/campaigns', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request, reply) => {
            const body = request.body;
            const item = await (0, communications_repository_1.createCampaign)(body);
            reply.code(201);
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'CREATE_CAMPAIGN',
                domain: 'communications',
                entityType: 'campaign',
                entityId: item?.id,
                after: item,
                ipAddress: request.ip,
            });
            return { data: item };
        });
        app.get('/api/v1/admin/message-templates', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async () => {
            const items = await (0, communications_repository_1.listMessageTemplates)();
            return { data: items, meta: { count: items.length } };
        });
        app.post('/api/v1/admin/message-templates', {
            preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
            schema: { body: schemas.CreateMessageTemplateSchema },
        }, async (request, reply) => {
            const body = request.body;
            const item = await (0, communications_repository_1.createMessageTemplate)(body);
            reply.code(201);
            return { data: item };
        });
        app.get('/api/v1/admin/delivery-logs', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request) => {
            const { page, pageSize } = getPagination(request.query);
            const items = await (0, communications_repository_1.listDeliveryLogs)(page, pageSize);
            return { data: items, meta: { page, pageSize } };
        });
        // ─── Finance ──────────────────────────────────────────────────────────
        app.get('/api/v1/admin/finance/funds', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async () => {
            const items = await (0, finances_repository_1.listFunds)();
            return { data: items, meta: { count: items.length } };
        });
        app.post('/api/v1/admin/finance/funds', {
            preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
            schema: { body: schemas.CreateFundSchema },
        }, async (request, reply) => {
            const body = request.body;
            const item = await (0, finances_repository_1.createFund)(body);
            reply.code(201);
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'CREATE_FUND',
                domain: 'finance',
                entityType: 'fund',
                entityId: item?.id,
                after: item,
                ipAddress: request.ip,
            });
            return { data: item };
        });
        app.get('/api/v1/admin/finance/payments', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request) => {
            const { page, pageSize } = getPagination(request.query);
            const items = await (0, finances_repository_1.listPayments)(page, pageSize);
            return { data: items, meta: { page, pageSize } };
        });
        app.get('/api/v1/admin/finance/donations', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request) => {
            const { page, pageSize } = getPagination(request.query);
            const items = await (0, finances_repository_1.listDonations)(page, pageSize);
            return { data: items, meta: { page, pageSize } };
        });
        app.post('/api/v1/public/donations', { schema: { body: schemas.CreateDonationIntentSchema } }, async (request, reply) => {
            const body = request.body;
            const item = await (0, finances_repository_1.createDonationIntent)(body);
            reply.code(201);
            return { data: item };
        });
        // ─── PSP Webhook ────────────────────────────────────────────────────────
        // Provider sends: { type, providerReference, provider }
        // In production: validate HMAC signature from X-Signature header
        app.post('/api/v1/public/payments/webhooks/:provider', async (request, reply) => {
            const body = request.body;
            const { provider } = request.params;
            // Acknowledge immediately; processing is idempotent
            reply.code(200);
            if (body.type === 'payment.captured' && body.providerReference) {
                try {
                    await (0, finances_repository_1.capturePayment)({
                        provider,
                        providerReference: body.providerReference,
                    });
                }
                catch (err) {
                    // Log but don't re-throw — we already sent 200
                    app.log.error({ err }, 'PSP webhook processing error');
                }
            }
            return { received: true };
        });
        // ─── Campaign Workflow ───────────────────────────────────────────────────
        app.post('/api/v1/admin/campaigns/:id/approve', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request) => {
            const { id } = request.params;
            const { db: prisma } = await Promise.resolve().then(() => __importStar(require('./repositories/prisma'))).then((m) => ({ db: m.getPrismaClient() }));
            const campaign = await prisma.campaign.update({
                where: { id },
                data: { status: 'APPROVED' },
            });
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'APPROVE_CAMPAIGN',
                domain: 'communications',
                entityType: 'campaign',
                entityId: id,
                after: campaign,
                ipAddress: request.ip,
            });
            return { data: campaign };
        });
        app.post('/api/v1/admin/campaigns/:id/send', { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] }, async (request, reply) => {
            const { id } = request.params;
            if (!jobQueue) {
                return reply.status(503).send({
                    error: 'service_unavailable',
                    message: 'Background delivery queue is not configured.',
                });
            }
            const { db: prisma } = await Promise.resolve().then(() => __importStar(require('./repositories/prisma'))).then((m) => ({ db: m.getPrismaClient() }));
            const campaign = await prisma.campaign.findUniqueOrThrow({
                where: { id },
            });
            await jobQueue.add('SEND_CAMPAIGN', {
                type: 'SEND_CAMPAIGN',
                payload: { id: campaign.id }
            });
            const sentCampaign = await prisma.campaign.update({
                where: { id },
                data: { status: 'SENT' },
            });
            await (0, audit_1.writeAuditLog)({
                actorUserId: request.user?.id,
                action: 'SEND_CAMPAIGN',
                domain: 'communications',
                entityType: 'campaign',
                entityId: id,
                after: sentCampaign,
                ipAddress: request.ip,
            });
            return { data: sentCampaign };
        });
    });
    // Search
    app.get('/api/v1/search', {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    q: { type: 'string' },
                    limit: { type: 'number', default: 10 },
                },
                required: ['q'],
            },
        },
    }, async (request, reply) => {
        const { q, limit } = request.query;
        const results = await searchRepository.search(q, limit);
        return reply.send({ data: results });
    });
    return app;
}
//# sourceMappingURL=app.js.map