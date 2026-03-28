"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClient = getPrismaClient;
exports.withRepositoryFallback = withRepositoryFallback;
const client_1 = require("@prisma/client");
let prismaClient = null;
const defaultDatabaseUrl = 'postgresql://postgres:postgres@localhost:5433/afc_sear_platform?schema=public';
function getPrismaClient() {
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = defaultDatabaseUrl;
    }
    if (!prismaClient) {
        prismaClient = new client_1.PrismaClient();
    }
    return prismaClient;
}
async function withRepositoryFallback(operation, fallback) {
    try {
        const data = await operation();
        return {
            data,
            source: 'database',
        };
    }
    catch {
        const data = await fallback();
        return {
            data,
            source: 'seed',
        };
    }
}
//# sourceMappingURL=prisma.js.map