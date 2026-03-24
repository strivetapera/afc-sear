import { defineConfig } from 'prisma/config';

const defaultDatabaseUrl =
  'postgresql://postgres:postgres@localhost:5433/afc_sear_platform?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: process.env.DATABASE_URL ?? defaultDatabaseUrl,
  },
});
