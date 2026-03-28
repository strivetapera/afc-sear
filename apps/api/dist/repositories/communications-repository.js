"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAnnouncements = listAnnouncements;
exports.listPublicAnnouncements = listPublicAnnouncements;
exports.createAnnouncement = createAnnouncement;
exports.updateAnnouncement = updateAnnouncement;
exports.listCampaigns = listCampaigns;
exports.createCampaign = createCampaign;
exports.listMessageTemplates = listMessageTemplates;
exports.createMessageTemplate = createMessageTemplate;
exports.listDeliveryLogs = listDeliveryLogs;
const prisma_1 = require("./prisma");
// ─── Announcements ────────────────────────────────────────────────────────────
async function listAnnouncements(page = 1, pageSize = 50) {
    const prisma = (0, prisma_1.getPrismaClient)();
    return prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { branch: { select: { id: true, name: true } } },
    });
}
async function listPublicAnnouncements() {
    const prisma = (0, prisma_1.getPrismaClient)();
    return prisma.announcement.findMany({
        where: { visibility: 'PUBLIC', publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
        select: { id: true, title: true, body: true, publishedAt: true, branchId: true },
    });
}
async function createAnnouncement(input) {
    const prisma = (0, prisma_1.getPrismaClient)();
    return prisma.announcement.create({
        data: {
            branchId: input.branchId ?? null,
            title: input.title,
            body: input.body,
            visibility: input.visibility ?? 'PUBLIC',
            publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        },
    });
}
async function updateAnnouncement(id, input) {
    const prisma = (0, prisma_1.getPrismaClient)();
    return prisma.announcement.update({
        where: { id },
        data: {
            ...(input.title !== undefined && { title: input.title }),
            ...(input.body !== undefined && { body: input.body }),
            ...(input.visibility !== undefined && { visibility: input.visibility }),
            ...(input.publishedAt !== undefined && {
                publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
            }),
        },
    });
}
// ─── Campaigns ────────────────────────────────────────────────────────────────
async function listCampaigns(page = 1, pageSize = 50) {
    const prisma = (0, prisma_1.getPrismaClient)();
    return prisma.campaign.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
            _count: { select: { recipients: true } },
        },
    });
}
async function createCampaign(input) {
    const prisma = (0, prisma_1.getPrismaClient)();
    return prisma.campaign.create({
        data: {
            name: input.name,
            channel: input.channel,
            audienceFilter: input.audienceFilter ?? {},
            scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
        },
    });
}
// ─── Message Templates ────────────────────────────────────────────────────────
async function listMessageTemplates() {
    const prisma = (0, prisma_1.getPrismaClient)();
    return prisma.messageTemplate.findMany({ orderBy: { key: 'asc' } });
}
async function createMessageTemplate(input) {
    const prisma = (0, prisma_1.getPrismaClient)();
    return prisma.messageTemplate.create({
        data: {
            channel: input.channel,
            key: input.key,
            subject: input.subject ?? null,
            body: input.body,
        },
    });
}
// ─── Delivery Logs ────────────────────────────────────────────────────────────
async function listDeliveryLogs(page = 1, pageSize = 50) {
    const prisma = (0, prisma_1.getPrismaClient)();
    return prisma.deliveryLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
            campaign: { select: { id: true, name: true } },
        },
    });
}
//# sourceMappingURL=communications-repository.js.map