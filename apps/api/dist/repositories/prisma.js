import { PrismaClient } from '@prisma/client';
let prismaClient = null;
const defaultDatabaseUrl = 'postgresql://postgres:postgres@localhost:5433/afc_sear_platform?schema=public';
export function getPrismaClient() {
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = defaultDatabaseUrl;
    }
    if (!prismaClient) {
        prismaClient = new PrismaClient();
    }
    return prismaClient;
}
export async function withRepositoryFallback(operation, fallback) {
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