import { PrismaClient } from '@prisma/client';

let prismaClient: PrismaClient | null = null;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not configured. Set it in the runtime environment or apps/api/.env before starting the API.'
    );
  }

  return databaseUrl;
}

export function getPrismaClient() {
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      datasourceUrl: getDatabaseUrl(),
    });
  }

  return prismaClient;
}

export interface RepositoryResult<T> {
  data: T;
  source: 'database' | 'seed';
}

export async function withRepositoryFallback<T>(
  operation: () => Promise<T>,
  fallback: () => T | Promise<T>
): Promise<RepositoryResult<T>> {
  try {
    const data = await operation();
    return {
      data,
      source: 'database',
    };
  } catch {
    const data = await fallback();
    return {
      data,
      source: 'seed',
    };
  }
}
