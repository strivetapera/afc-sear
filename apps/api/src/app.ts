import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import authPlugin from './plugins/auth';
import type {
  AssignRoleRequest,
  CheckInRequest,
  CreateBranchRequest,
  CreateContentItemRequest,
  SignInRequest,
  UpsertPersonRequest,
} from './modules';
import {
  createContentItemRecord,
  getPublicEventsFeed,
  getPublicLiveWebcast,
  getPublicNewsFeed,
  getPublishedContentBySlug,
  getStructuredPageBySlug,
  listContentItemRecords,
  getContentItemById,
  updateContentItem,
  publishContentItem,
} from './repositories/content-repository';
import { assignRole, getCurrentUserProfile, signIn } from './repositories/identity-repository';
import { createBranch, getLocationsDirectory, listMinistries, listPublicBranches } from './repositories/organization-repository';
import { getCurrentHousehold, listPeopleRecords, upsertPersonRecord, updateMemberProfile, getMemberRegistrations, getMemberGiving, getMemberAnnouncements, createPrayerRequest } from './repositories/people-repository';
import {
  getEventBySlug,
  listEventRegistrations,
  listPublicEvents,
  registerForEvent,
  recordCheckIn,
  createEvent,
  updateEvent,
  listAdminEvents,
  addSchedule,
  addTicketType,
} from './repositories/event-repository';
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  listPublicAnnouncements,
  listCampaigns,
  createCampaign,
  listMessageTemplates,
  createMessageTemplate,
  listDeliveryLogs,
} from './repositories/communications-repository';
import {
  listFunds,
  createFund,
  listPayments,
  listDonations,
  createDonationIntent,
  capturePayment,
} from './repositories/finances-repository';
import { writeAuditLog } from './repositories/audit';
import type { RegisterForEventRequest } from './modules';
import * as schemas from './schemas';

/**
 * Helper to extract pagination from query params
 */
function getPagination(query: any) {
  const page = Math.max(1, parseInt(query.page ?? '1', 10));
  const pageSize = Math.max(1, Math.min(100, parseInt(query.pageSize ?? '50', 10)));
  return { page, pageSize };
}

const ADMIN_ROLE = 'admin';

export function createApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: '*', // For development; refine for production if needed
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.register(authPlugin, {
    issuerUrl: process.env.KEYCLOAK_ISSUER_URL || 'http://localhost:8080/realms/afc',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'afc-api',
  });

  app.after(() => {
    // ─── Health & OpenAPI ────────────────────────────────────────────────────
    app.get('/health', async () => ({
      status: 'ok',
      service: '@afc-sear/api',
      timestamp: new Date().toISOString(),
    }));

    app.get('/openapi.yaml', async (_request, reply) => {
      const specPath = join(process.cwd(), 'openapi', 'openapi.yaml');
      const spec = await readFile(specPath, 'utf8');
      reply.type('application/yaml');
      return spec;
    });

    // ─── Identity ────────────────────────────────────────────────────────────
    app.post<{ Body: SignInRequest }>(
      '/api/v1/auth/sign-in',
      { schema: { body: schemas.SignInSchema } },
      async (request, reply) => {
      const result = await signIn(request.body);
      if (!result.data) {
        reply.code(401);
        return {
          error: 'invalid_credentials',
          message: 'The provided login details were not accepted by the current authentication source.',
        };
      }
      return { data: result.data, meta: { source: result.source } };
    });

    app.get('/api/v1/me', { preHandler: [app.authenticate] }, async (request) => {
      const result = await getCurrentUserProfile();
      return { data: result.data, meta: { source: result.source } };
    });

    app.patch(
      '/api/v1/me/profile',
      {
        preHandler: [app.authenticate],
        schema: { body: schemas.UpdateProfileSchema },
      },
      async (request) => {
        const userId = request.user?.id ?? '';
        const body = request.body as any;
        const result = await updateMemberProfile(userId, body);
        return { data: result };
      }
    );

    app.get('/api/v1/me/household', { preHandler: [app.authenticate] }, async () => {
      const result = await getCurrentHousehold();
      return { data: result.data, meta: { source: result.source } };
    });

    app.get('/api/v1/me/registrations', { preHandler: [app.authenticate] }, async (request) => {
      const userId = request.user?.id ?? '';
      const items = await getMemberRegistrations(userId);
      return { data: items, meta: { count: items.length } };
    });

    app.get('/api/v1/me/giving', { preHandler: [app.authenticate] }, async (request) => {
      const userId = request.user?.id ?? '';
      const items = await getMemberGiving(userId);
      return { data: items, meta: { count: items.length } };
    });

    app.get('/api/v1/me/announcements', { preHandler: [app.authenticate] }, async (request) => {
      const userId = request.user?.id ?? '';
      const items = await getMemberAnnouncements(userId);
      return { data: items, meta: { count: items.length } };
    });

    app.post(
      '/api/v1/me/prayer-requests',
      {
        preHandler: [app.authenticate],
        schema: { body: schemas.PrayerRequestSchema },
      },
      async (request, reply) => {
        const userId = request.user?.id ?? '';
        const body = request.body as any;
        const item = await createPrayerRequest(userId, body);
        reply.code(201);
        return { data: item };
      }
    );

    app.post<{ Body: AssignRoleRequest }>(
      '/api/v1/admin/identity/assign-role',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request) => {
        const result = await assignRole(request.body);
        await writeAuditLog({
          actorUserId: request.user?.id,
          action: 'ASSIGN_ROLE',
          domain: 'identity',
          entityType: 'user',
          entityId: request.body.userId,
          after: { roleKey: request.body.roleKey },
          ipAddress: request.ip,
        });
        return { data: result.data, meta: { source: result.source } };
      }
    );

    // ─── Organization ────────────────────────────────────────────────────────
    app.get('/api/v1/public/branches', async () => {
      const result = await listPublicBranches();
      return { data: result.data, meta: { source: result.source, count: result.data.length } };
    });

    app.get('/api/v1/public/locations-directory', async () => {
      const result = await getLocationsDirectory();
      return { data: result.data, meta: { source: result.source } };
    });

    app.post<{ Body: CreateBranchRequest }>(
      '/api/v1/admin/branches',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request, reply) => {
        const result = await createBranch(request.body);
        reply.code(201);
        await writeAuditLog({
          actorUserId: request.user?.id,
          action: 'CREATE_BRANCH',
          domain: 'organization',
          entityType: 'branch',
          entityId: (result.data as any)?.id,
          after: result.data as any,
          ipAddress: request.ip,
        });
        return { data: result.data, meta: { source: result.source } };
      }
    );

    app.get(
      '/api/v1/admin/ministries',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async () => {
        const result = await listMinistries();
        return { data: result.data, meta: { source: result.source, count: result.data.length } };
      }
    );

    // ─── People ──────────────────────────────────────────────────────────────
    app.get(
      '/api/v1/admin/people',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request) => {
        const { page, pageSize } = getPagination(request.query);
        const result = await listPeopleRecords(page, pageSize);
        return { data: result.data, meta: { source: result.source, page, pageSize } };
      }
    );

    app.post<{ Body: UpsertPersonRequest }>(
      '/api/v1/admin/people',
      {
        preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
        schema: { body: schemas.UpsertPersonSchema },
      },
      async (request) => {
        const result = await upsertPersonRecord(request.body);
        await writeAuditLog({
          actorUserId: request.user?.id,
          action: 'UPSERT_PERSON',
          domain: 'people',
          entityType: 'person',
          entityId: (result.data as any)?.id,
          after: result.data as any,
          ipAddress: request.ip,
        });
        return { data: result.data, meta: { source: result.source } };
      }
    );


    // ─── Content ─────────────────────────────────────────────────────────────
    app.get<{ Params: { slug: string } }>('/api/v1/public/pages/:slug', async (request, reply) => {
      const result = await getPublishedContentBySlug(request.params.slug);
      if (!result.data) {
        reply.code(404);
        return { error: 'not_found', message: `No published content was found for slug "${request.params.slug}".` };
      }
      return { data: result.data, meta: { source: result.source } };
    });

    app.get<{ Params: { slug: string } }>(
      '/api/v1/public/structured-pages/:slug',
      async (request, reply) => {
        const result = await getStructuredPageBySlug(request.params.slug);
        if (!result.data) {
          reply.code(404);
          return { error: 'not_found', message: `No structured page was found for slug "${request.params.slug}".` };
        }
        return { data: result.data, meta: { source: result.source } };
      }
    );

    app.get('/api/v1/public/news', async () => {
      const result = await getPublicNewsFeed();
      return { data: result.data, meta: { source: result.source, count: result.data.items.length } };
    });

    app.get('/api/v1/public/events', async () => {
      const result = await getPublicEventsFeed();
      return { data: result.data, meta: { source: result.source, count: result.data.items.length } };
    });

    app.get('/api/v1/public/live-webcast', async () => {
      const result = await getPublicLiveWebcast();
      return { data: result.data, meta: { source: result.source, count: result.data.schedule.length } };
    });

    app.get(
      '/api/v1/admin/content-items',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request) => {
        const { page, pageSize } = getPagination(request.query);
        const result = await listContentItemRecords(page, pageSize);
        return { data: result.data, meta: { source: result.source, page, pageSize } };
      }
    );

    app.post<{ Body: CreateContentItemRequest }>(
      '/api/v1/admin/content-items',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request, reply) => {
        const result = await createContentItemRecord({
          contentTypeKey: request.body.contentTypeKey,
          branchId: request.body.branchId,
          title: request.body.title,
          slug: request.body.slug,
          summary: request.body.summary,
          visibility: request.body.visibility,
        });
        reply.code(201);
        await writeAuditLog({
          actorUserId: request.user?.id,
          action: 'CREATE_CONTENT_ITEM',
          domain: 'content',
          entityType: 'content_item',
          entityId: (result.data as any)?.id,
          after: result.data as any,
          ipAddress: request.ip,
        });
        return { data: result.data, meta: { source: result.source } };
      }
    );

    app.get<{ Params: { id: string } }>(
      '/api/v1/admin/content-items/:id',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request, reply) => {
        const result = await getContentItemById(request.params.id);
        if (!result.data) {
          reply.code(404);
          return { error: 'not_found' };
        }
        return result;
      }
    );

    app.patch<{ Params: { id: string }; Body: any }>(
      '/api/v1/admin/content-items/:id',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request) => {
        const before = await getContentItemById(request.params.id);
        const result = await updateContentItem(request.params.id, request.body as any);
        await writeAuditLog({
          actorUserId: request.user?.id,
          action: 'UPDATE_CONTENT_ITEM',
          domain: 'content',
          entityType: 'content_item',
          entityId: request.params.id,
          before: (before.data as any) ?? null,
          after: (result as any)?.data ?? null,
          ipAddress: request.ip,
        });
        return result;
      }
    );

    app.post<{ Params: { id: string } }>(
      '/api/v1/admin/content-items/:id/publish',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request) => {
        const result = await publishContentItem(request.params.id);
        await writeAuditLog({
          actorUserId: request.user?.id,
          action: 'PUBLISH_CONTENT_ITEM',
          domain: 'content',
          entityType: 'content_item',
          entityId: request.params.id,
          ipAddress: request.ip,
        });
        return result;
      }
    );

    // ─── Events ──────────────────────────────────────────────────────────────
    app.get('/api/v1/public/events/list', async () => {
      const events = await listPublicEvents();
      return { data: events };
    });

    app.get<{ Params: { slug: string } }>('/api/v1/public/events/:slug', async (request, reply) => {
      const event = await getEventBySlug(request.params.slug);
      if (!event) {
        reply.code(404);
        return { error: 'not_found' };
      }
      return { data: event };
    });

    app.post<{ Params: { slug: string }; Body: RegisterForEventRequest }>(
      '/api/v1/public/events/:slug/register',
      async (request) => {
        return registerForEvent(request.params.slug, request.body);
      }
    );

    app.get(
      '/api/v1/admin/events',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async () => {
        const events = await listAdminEvents();
        return { data: events };
      }
    );

    app.post<{ Body: any }>(
      '/api/v1/admin/events',
      {
        preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
        schema: { body: schemas.CreateEventSchema },
      },
      async (request, reply) => {
        const body = request.body as any;
        const event = await createEvent(body);
        reply.code(201);
        await writeAuditLog({
          actorUserId: request.user?.id,
          action: 'CREATE_EVENT',
          domain: 'events',
          entityType: 'event',
          entityId: (event as any)?.id,
          after: event as any,
          ipAddress: request.ip,
        });
        return { data: event };
      }
    );

    app.patch<{ Params: { id: string }; Body: any }>(
      '/api/v1/admin/events/:id',
      {
        preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
        schema: { body: schemas.UpdateEventSchema },
      },
      async (request) => {
        const body = request.body as any;
        const event = await updateEvent(request.params.id, body);
        await writeAuditLog({
          actorUserId: request.user?.id,
          action: 'UPDATE_EVENT',
          domain: 'events',
          entityType: 'event',
          entityId: request.params.id,
          after: event as any,
          ipAddress: request.ip,
        });
        return { data: event };
      }
    );

    app.post<{ Params: { id: string }; Body: any }>(
      '/api/v1/admin/events/:id/schedules',
      {
        preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
        schema: { body: schemas.AddEventScheduleSchema },
      },
      async (request, reply) => {
        const body = request.body as any;
        const schedule = await addSchedule(request.params.id, body);
        reply.code(201);
        return { data: schedule };
      }
    );

    app.post<{ Params: { id: string }; Body: any }>(
      '/api/v1/admin/events/:id/ticket-types',
      {
        preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
        schema: { body: schemas.AddTicketTypeSchema },
      },
      async (request, reply) => {
        const body = request.body as any;
        const ticketType = await addTicketType(request.params.id, body);
        reply.code(201);
        return { data: ticketType };
      }
    );

    app.get<{ Params: { id: string } }>(
      '/api/v1/admin/events/:id/registrations',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request) => {
        return { data: await listEventRegistrations(request.params.id) };
      }
    );

    app.post<{ Params: { id: string }; Body: CheckInRequest }>(
      '/api/v1/admin/events/:id/check-in',
      {
        preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
        schema: { body: schemas.CheckInSchema },
      },
      async (request) => {
        const actorId = request.user?.id;
        const result = await recordCheckIn(request.body.attendeeId, actorId);
        await writeAuditLog({
          actorUserId: actorId,
          action: 'CHECK_IN_ATTENDEE',
          domain: 'events',
          entityType: 'registration_attendee',
          entityId: request.body.attendeeId,
          after: result as any,
          ipAddress: request.ip,
        });
        return { data: result };
      }
    );

    // ─── Communications ────────────────────────────────────────────────────
    app.get('/api/v1/public/announcements', async () => {
      const items = await listPublicAnnouncements();
      return { data: items, meta: { count: items.length } };
    });

    app.get(
      '/api/v1/admin/announcements',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async () => {
        const items = await listAnnouncements();
        return { data: items, meta: { count: items.length } };
      }
    );

    app.post<{ Body: any }>(
      '/api/v1/admin/announcements',
      {
        preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
        schema: { body: schemas.CreateAnnouncementSchema },
      },
      async (request, reply) => {
        const body = request.body as any;
        const item = await createAnnouncement(body);
        reply.code(201);
        await writeAuditLog({
          actorUserId: request.user?.id,
          action: 'CREATE_ANNOUNCEMENT',
          domain: 'communications',
          entityType: 'announcement',
          entityId: (item as any)?.id,
          after: item as any,
          ipAddress: request.ip,
        });
        return { data: item };
      }
    );

    app.patch<{ Params: { id: string }; Body: any }>(
      '/api/v1/admin/announcements/:id',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request) => {
        const body = request.body as Partial<{ title: string; body: object; visibility: string; publishedAt: string | null }>;
        const item = await updateAnnouncement(request.params.id, body);
        await writeAuditLog({
          actorUserId: request.user?.id,
          action: 'UPDATE_ANNOUNCEMENT',
          domain: 'communications',
          entityType: 'announcement',
          entityId: request.params.id,
          after: item as any,
          ipAddress: request.ip,
        });
        return { data: item };
      }
    );

    app.get(
      '/api/v1/admin/campaigns',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async () => {
        const items = await listCampaigns();
        return { data: items, meta: { count: items.length } };
      }
    );

    app.post<{ Body: any }>(
      '/api/v1/admin/campaigns',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request, reply) => {
        const body = request.body as { name: string; channel: string; audienceFilter?: object; scheduledFor?: string };
        const item = await createCampaign(body);
        reply.code(201);
        await writeAuditLog({
          actorUserId: request.user?.id,
          action: 'CREATE_CAMPAIGN',
          domain: 'communications',
          entityType: 'campaign',
          entityId: (item as any)?.id,
          after: item as any,
          ipAddress: request.ip,
        });
        return { data: item };
      }
    );

    app.get(
      '/api/v1/admin/message-templates',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async () => {
        const items = await listMessageTemplates();
        return { data: items, meta: { count: items.length } };
      }
    );

    app.post<{ Body: any }>(
      '/api/v1/admin/message-templates',
      {
        preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
        schema: { body: schemas.CreateMessageTemplateSchema },
      },
      async (request, reply) => {
        const body = request.body as any;
        const item = await createMessageTemplate(body);
        reply.code(201);
        return { data: item };
      }
    );

    app.get(
      '/api/v1/admin/delivery-logs',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request) => {
        const { page, pageSize } = getPagination(request.query);
        const items = await listDeliveryLogs(page, pageSize);
        return { data: items, meta: { page, pageSize } };
      }
    );

    // ─── Finance ──────────────────────────────────────────────────────────
    app.get(
      '/api/v1/admin/finance/funds',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async () => {
        const items = await listFunds();
        return { data: items, meta: { count: items.length } };
      }
    );

    app.post<{ Body: any }>(
      '/api/v1/admin/finance/funds',
      {
        preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)],
        schema: { body: schemas.CreateFundSchema },
      },
      async (request, reply) => {
        const body = request.body as any;
        const item = await createFund(body);
        reply.code(201);
        await writeAuditLog({
          actorUserId: request.user?.id,
          action: 'CREATE_FUND',
          domain: 'finance',
          entityType: 'fund',
          entityId: (item as any)?.id,
          after: item as any,
          ipAddress: request.ip,
        });
        return { data: item };
      }
    );

    app.get(
      '/api/v1/admin/finance/payments',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request) => {
        const { page, pageSize } = getPagination(request.query);
        const items = await listPayments(page, pageSize);
        return { data: items, meta: { page, pageSize } };
      }
    );

    app.get(
      '/api/v1/admin/finance/donations',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request) => {
        const { page, pageSize } = getPagination(request.query);
        const items = await listDonations(page, pageSize);
        return { data: items, meta: { page, pageSize } };
      }
    );

    app.post<{ Body: any }>(
      '/api/v1/public/donations',
      { schema: { body: schemas.CreateDonationIntentSchema } },
      async (request, reply) => {
        const body = request.body as any;
        const item = await createDonationIntent(body);
        reply.code(201);
        return { data: item };
      }
    );

    // ─── PSP Webhook ────────────────────────────────────────────────────────
    // Provider sends: { type, providerReference, provider }
    // In production: validate HMAC signature from X-Signature header
    app.post<{ Params: { provider: string }; Body: any }>(
      '/api/v1/public/payments/webhooks/:provider',
      async (request, reply) => {
        const body = request.body as { type?: string; providerReference?: string };
        const { provider } = request.params;

        // Acknowledge immediately; processing is idempotent
        reply.code(200);

        if (body.type === 'payment.captured' && body.providerReference) {
          try {
            await capturePayment({
              provider,
              providerReference: body.providerReference,
            });
          } catch (err) {
            // Log but don't re-throw — we already sent 200
            app.log.error({ err }, 'PSP webhook processing error');
          }
        }

        return { received: true };
      }
    );

    // ─── Campaign Workflow ───────────────────────────────────────────────────
    app.post<{ Params: { id: string } }>(
      '/api/v1/admin/campaigns/:id/approve',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request) => {
        const { id } = request.params;
        const { db: prisma } = await import('./repositories/prisma').then((m) => ({ db: m.getPrismaClient() }));
        const campaign = await prisma.campaign.update({
          where: { id },
          data: { status: 'APPROVED' },
        });
        await writeAuditLog({
          actorUserId: request.user?.id,
          action: 'APPROVE_CAMPAIGN',
          domain: 'communications',
          entityType: 'campaign',
          entityId: id,
          after: campaign as any,
          ipAddress: request.ip,
        });
        return { data: campaign };
      }
    );

    app.post<{ Params: { id: string } }>(
      '/api/v1/admin/campaigns/:id/send',
      { preHandler: [app.authenticate, app.requireRole(ADMIN_ROLE)] },
      async (request) => {
        const { id } = request.params;
        const { db: prisma } = await import('./repositories/prisma').then((m) => ({ db: m.getPrismaClient() }));
        const campaign = await prisma.campaign.update({
          where: { id },
          data: { status: 'SENT' },
        });
        await writeAuditLog({
          actorUserId: request.user?.id,
          action: 'SEND_CAMPAIGN',
          domain: 'communications',
          entityType: 'campaign',
          entityId: id,
          after: campaign as any,
          ipAddress: request.ip,
        });
        // TODO: enqueue actual delivery job via worker
        return { data: campaign };
      }
    );
  });

  return app;
}
