# AFC SEAR Platform

Monorepo for the Apostolic Faith Church Southern and East Africa Region platform. The repository contains the public website, the admin dashboard, the member portal, the API, and shared packages used across them.

## Workspaces

### Apps

- `apps/api` - Fastify API for public content, admin operations, member APIs, auth, and event registration.
- `apps/web` - Next.js public-facing website on port `3000`.
- `apps/admin` - Next.js admin dashboard on port `3001`.
- `apps/portal` - Next.js member portal on port `3002`.
- `apps/worker` - background worker scaffold; not production-initialized yet.

### Packages

- `packages/db` - Prisma schema, migrations, and seed data.
- `packages/auth` - shared Better Auth configuration.
- `packages/ui` - shared UI components.
- `packages/types` - shared TypeScript contracts.

## Current Architecture

- API: `http://localhost:4000`
- Public web: `http://localhost:3000`
- Admin: `http://localhost:3001`
- Portal: `http://localhost:3002`

The API exposes:

- public routes under `/api/v1/public/*`
- auth under `/api/v1/auth/*`
- member routes under `/api/v1/me*`
- admin routes under `/api/v1/admin/*`
- health checks at `/api/v1/health-check` and `/health`

## Prerequisites

- Node.js `20+`
- npm `10+`
- PostgreSQL `16+` or Docker for local Postgres
- Redis `7+` only if you want background jobs enabled locally

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

At minimum, set the following values.

#### `packages/db/.env` or shell environment

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/afc_sear_platform?schema=public"
```

#### `apps/api/.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/afc_sear_platform?schema=public"
BETTER_AUTH_SECRET="development-secret-key-at-least-32-chars-long"
BETTER_AUTH_URL="http://localhost:4000"
ADMIN_URL="http://localhost:3001"
WEB_URL="http://localhost:3000"
PORTAL_URL="http://localhost:3002"
# Optional. If omitted, the API starts cleanly with background jobs disabled.
# REDIS_URL="redis://localhost:6379"
```

#### `apps/web/.env`

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

#### `apps/admin/.env`

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WEB_URL="http://localhost:3000"
```

#### `apps/portal/.env`

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

Notes:

- Do not set `NODE_ENV` in these `.env` files.
- `NEXT_PUBLIC_API_URL` should point at the API origin, for example `http://localhost:4000`.
- If `REDIS_URL` is not set, the API logs one warning and disables queue-backed background work by design.

### 3. Start local infrastructure

Bring up Postgres:

```bash
npm run db:up
```

If you want local Redis as well:

```bash
docker compose up -d redis
```

### 4. Initialize the database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

The seed loads baseline content, public pages, events, branches, and admin users.

### 5. Optional: reset the primary admin credential

If you need to guarantee the default admin account exists with the known password:

```bash
set -a
source apps/api/.env
set +a
npx tsx scripts/seed-admin.ts
```

Default admin credential:

- email: `admin@apostolicfaith.example`
- password: `changeme-admin`

## Running The Platform Locally

Start each service in its own terminal.

### API

```bash
npm run api:dev
```

### Public website

```bash
npm run dev --workspace=@afc-sear/web
```

### Admin dashboard

```bash
npm run dev --workspace=@afc-sear/admin
```

### Member portal

```bash
npm run dev --workspace=@afc-sear/portal
```

## Production Build And Start

Build all production apps:

```bash
npm run build --workspace=@afc-sear/api
npm run build --workspace=@afc-sear/web
npm run build --workspace=@afc-sear/admin
npm run build --workspace=@afc-sear/portal
```

Start them:

```bash
npm run start --workspace=@afc-sear/api
npm run start --workspace=@afc-sear/web
npm run start --workspace=@afc-sear/admin
npm run start --workspace=@afc-sear/portal
```

Default production ports:

- API: `4000`
- Web: `3000`
- Admin: `3001`
- Portal: `3002`

## Operational Verification

### Health checks

- API health: `http://localhost:4000/api/v1/health-check`
- API service status: `http://localhost:4000/health`

### Core smoke-test routes

- Public site: `http://localhost:3000/`
- Public content page: `http://localhost:3000/about`
- Public webcast page: `http://localhost:3000/live-webcast`
- Public event page: `http://localhost:3000/events/youth-conference-2026`
- Admin login: `http://localhost:3001/auth/login`
- Admin content: `http://localhost:3001/content`
- Member portal login: `http://localhost:3002/login`

### Admin-managed public content flow

1. Sign in at `http://localhost:3001/auth/login`.
2. Create or edit a content item in `/content`.
3. Publish the item.
4. Verify it renders publicly at `http://localhost:3000/<slug>`.

## Access Model

- Public users can access published public content only.
- Portal users can access their own member-scoped data via `/api/v1/me*`.
- Admin and super admin users can access administrative website data and content-management features.

## Deployment Checklist

1. Set production values for `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ADMIN_URL`, `WEB_URL`, and `PORTAL_URL`.
2. Provide `REDIS_URL` if you need background job delivery enabled.
3. Run `npm run db:generate`.
4. Run `npm run db:migrate`.
5. Seed or provision an initial admin account.
6. Build all four active apps.
7. Start API, web, admin, and portal with their production URLs and ports.
8. Smoke test auth, content publishing, event registration, and portal login/logout after deploy.

## Troubleshooting

### Admin login does not work

- Confirm the API is running before opening the admin or portal.
- Confirm `BETTER_AUTH_URL`, `ADMIN_URL`, `WEB_URL`, and `PORTAL_URL` match the real origins.
- Re-run `npx tsx scripts/seed-admin.ts` if the admin credential was overwritten in local development.

### Public content does not appear

- Make sure the content item is published, not draft-only.
- Confirm `NEXT_PUBLIC_WEB_URL` in admin points at the correct public site origin.

### Background jobs are disabled

- This is expected if `REDIS_URL` is not set.
- Start Redis and set `REDIS_URL` to enable queue-backed jobs.

### Port conflicts

Default ports in this repo are `4000`, `3000`, `3001`, and `3002`. Stop old processes before restarting services.
