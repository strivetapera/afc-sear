import { vi } from 'vitest';

// Create a stable mock for Prisma
const prismaMock = {
  event: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  registration: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn((cb) => cb(prismaMock)),
};

// Mock the local prisma provider
vi.mock('../repositories/prisma', () => ({
  getPrismaClient: () => prismaMock,
  withRepositoryFallback: async (op: any) => ({ data: await op(), source: 'database' }),
}));

// Export mock for use in tests if needed via vi.mocked
export { prismaMock };
