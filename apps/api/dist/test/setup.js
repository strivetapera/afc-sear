"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaMock = void 0;
const vitest_1 = require("vitest");
// Create a stable mock for Prisma
const prismaMock = {
    event: {
        findMany: vitest_1.vi.fn(),
        findUnique: vitest_1.vi.fn(),
        findUniqueOrThrow: vitest_1.vi.fn(),
        create: vitest_1.vi.fn(),
        update: vitest_1.vi.fn(),
        delete: vitest_1.vi.fn(),
    },
    registration: {
        findMany: vitest_1.vi.fn(),
        create: vitest_1.vi.fn(),
    },
    $transaction: vitest_1.vi.fn((cb) => cb(prismaMock)),
};
exports.prismaMock = prismaMock;
// Mock the local prisma provider
vitest_1.vi.mock('../repositories/prisma', () => ({
    getPrismaClient: () => prismaMock,
    withRepositoryFallback: async (op) => ({ data: await op(), source: 'database' }),
}));
//# sourceMappingURL=setup.js.map