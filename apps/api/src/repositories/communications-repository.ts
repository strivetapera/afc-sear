import { getPrismaClient } from './prisma';

// ─── Announcements ────────────────────────────────────────────────────────────

export async function listAnnouncements(page = 1, pageSize = 50) {
  const prisma = getPrismaClient();
  return prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { branch: { select: { id: true, name: true } } },
  });
}

export async function listPublicAnnouncements() {
  const prisma = getPrismaClient();
  return prisma.announcement.findMany({
    where: { visibility: 'PUBLIC', publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    select: { id: true, title: true, body: true, publishedAt: true, branchId: true },
  });
}

export async function createAnnouncement(input: {
  branchId?: string;
  title: string;
  body: object;
  visibility?: string;
  publishedAt?: string;
}) {
  const prisma = getPrismaClient();
  return prisma.announcement.create({
    data: {
      branchId: input.branchId ?? null,
      title: input.title,
      body: input.body,
      visibility: (input.visibility as any) ?? 'PUBLIC',
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
    },
  });
}

export async function updateAnnouncement(id: string, input: Partial<{
  title: string;
  body: object;
  visibility: string;
  publishedAt: string | null;
}>) {
  const prisma = getPrismaClient();
  return prisma.announcement.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.visibility !== undefined && { visibility: input.visibility as any }),
      ...(input.publishedAt !== undefined && {
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
      }),
    },
  });
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export async function listCampaigns(page = 1, pageSize = 50) {
  const prisma = getPrismaClient();
  return prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      _count: { select: { recipients: true } },
    },
  });
}

export async function createCampaign(input: {
  name: string;
  channel: string;
  audienceFilter?: object;
  scheduledFor?: string;
}) {
  const prisma = getPrismaClient();
  return prisma.campaign.create({
    data: {
      name: input.name,
      channel: input.channel as any,
      audienceFilter: input.audienceFilter ?? {},
      scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
    },
  });
}

// ─── Message Templates ────────────────────────────────────────────────────────

export async function listMessageTemplates() {
  const prisma = getPrismaClient();
  return prisma.messageTemplate.findMany({ orderBy: { key: 'asc' } });
}

export async function createMessageTemplate(input: {
  channel: string;
  key: string;
  subject?: string;
  body: string;
}) {
  const prisma = getPrismaClient();
  return prisma.messageTemplate.create({
    data: {
      channel: input.channel as any,
      key: input.key,
      subject: input.subject ?? null,
      body: input.body,
    },
  });
}

// ─── Delivery Logs ────────────────────────────────────────────────────────────

export async function listDeliveryLogs(page = 1, pageSize = 50) {
  const prisma = getPrismaClient();
  return prisma.deliveryLog.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      campaign: { select: { id: true, name: true } },
    },
  });
}
