"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFunds = listFunds;
exports.createFund = createFund;
exports.listPayments = listPayments;
exports.getPaymentById = getPaymentById;
exports.capturePayment = capturePayment;
exports.listDonations = listDonations;
exports.createDonationIntent = createDonationIntent;
const prisma_1 = require("./prisma");
// Finance Repository - Handles Funds, Payments, and Donations
async function listFunds() {
    const prisma = (0, prisma_1.getPrismaClient)();
    return prisma.fund.findMany({
        orderBy: { name: 'asc' },
        include: {
            branch: { select: { id: true, name: true } },
            _count: { select: { donations: true } },
        },
    });
}
async function createFund(input) {
    const prisma = (0, prisma_1.getPrismaClient)();
    return prisma.fund.create({
        data: {
            branchId: input.branchId ?? null,
            name: input.name,
            code: input.code.toUpperCase(),
            isRestricted: input.isRestricted ?? false,
        },
    });
}
// ─── Payments ─────────────────────────────────────────────────────────────────
async function listPayments(page = 1, pageSize = 50) {
    const prisma = (0, prisma_1.getPrismaClient)();
    return prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
            donations: {
                include: { fund: { select: { name: true, code: true } } },
            },
            receipt: { select: { receiptNumber: true, issuedAt: true } },
        },
    });
}
async function getPaymentById(id) {
    const prisma = (0, prisma_1.getPrismaClient)();
    return prisma.payment.findUnique({
        where: { id },
        include: {
            donations: { include: { fund: true } },
            receipt: true,
            refunds: true,
        },
    });
}
/**
 * Marks a payment as PAID and creates a receipt record.
 * Called by the PSP webhook handler.
 */
async function capturePayment(input) {
    const prisma = (0, prisma_1.getPrismaClient)();
    const payment = await prisma.payment.findFirst({
        where: { providerReference: input.providerReference },
    });
    if (!payment)
        throw new Error(`Payment not found: ${input.providerReference}`);
    if (payment.status === 'PAID')
        return payment; // idempotent
    const [updatedPayment] = await prisma.$transaction([
        prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'PAID',
                provider: input.provider,
                capturedAt: input.capturedAt ?? new Date(),
            },
        }),
        prisma.receipt.create({
            data: {
                paymentId: payment.id,
                receiptNumber: `RCP-${Date.now()}`,
                issuedAt: new Date(),
                deliveryStatus: 'PENDING',
            },
        }),
    ]);
    return updatedPayment;
}
// ─── Donations ────────────────────────────────────────────────────────────────
async function listDonations(page = 1, pageSize = 50) {
    const prisma = (0, prisma_1.getPrismaClient)();
    return prisma.donation.findMany({
        orderBy: { donatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
            fund: { select: { name: true, code: true } },
            payment: { select: { amountMinor: true, currencyCode: true, status: true } },
        },
    });
}
async function createDonationIntent(input) {
    const prisma = (0, prisma_1.getPrismaClient)();
    const payment = await prisma.payment.create({
        data: {
            personId: input.personId ?? null,
            provider: 'PENDING',
            providerReference: `intent_${Date.now()}`,
            amountMinor: input.amountMinor,
            currencyCode: input.currencyCode,
            status: 'PENDING',
        },
    });
    const donation = await prisma.donation.create({
        data: {
            paymentId: payment.id,
            fundId: input.fundId,
            personId: input.personId ?? null,
            householdId: input.householdId ?? null,
            donatedAt: new Date(),
        },
        include: {
            fund: { select: { name: true, code: true } },
        },
    });
    return { payment, donation };
}
//# sourceMappingURL=finances-repository.js.map