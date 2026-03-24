import { getPrismaClient } from './prisma';
export async function writeAuditLog(input) {
    const prisma = getPrismaClient();
    try {
        const toJson = (v) => v != null ? JSON.parse(JSON.stringify(v)) : undefined;
        await prisma.auditLog.create({
            data: {
                actorUserId: input.actorUserId ?? null,
                action: input.action,
                domain: input.domain,
                entityType: input.entityType,
                entityId: input.entityId ?? null,
                before: toJson(input.before ?? null),
                after: toJson(input.after ?? null),
                ipAddress: input.ipAddress ?? null,
            },
        });
    }
    catch (err) {
        // Audit logging must never block the primary operation
        console.error('[audit] Failed to write audit log:', err);
    }
}
//# sourceMappingURL=audit.js.map