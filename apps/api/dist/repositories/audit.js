"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAuditLog = writeAuditLog;
const prisma_1 = require("./prisma");
async function writeAuditLog(input) {
    const prisma = (0, prisma_1.getPrismaClient)();
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