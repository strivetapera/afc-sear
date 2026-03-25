# AFC SEAR Platform

The platform for the Apostolic Faith Church (AFC) Southern & East Africa Region (SEAR), providing centralized management for branches, events, and community engagement.

## Project Structure

This is a monorepo powered by npm workspaces:

- `apps/api`: Fastify-based REST API server.
- `apps/web`: Next.js public-facing website.
- `apps/admin`: Next.js admin dashboard.
- `packages/db`: Prisma schema and database client.
- `packages/ui`: Shared UI component library.

## Prerequisites

- **Node.js**: v20 or newer.
- **npm**: v10 or newer.
- **PostgreSQL**: Local instance or Neon.tech database.
- **Docker**: Optional, for local database hosting.

## Setup Instructions

### 1. Install Dependencies
From the root directory:
```bash
npm install
```

### 2. Environment Configuration
Create or update `.env` files in the following locations (if not using defaults):

**Root or `packages/db`**:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/afc_sear_platform?schema=public"
```

**`apps/api`**:
```env
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:4000" # API URL
```

**`apps/web` & `apps/admin`**:
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### 3. Database Management
If using the local Docker-based database:
```bash
npm run db:up
```

Initialize the database schema and types:
```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database (dev)
npm run db:seed      - auth: Better Auth (OpenID Connect / Session-based) with MFA and RBAC
```

## Running the Applications

To run the whole system in development mode:

### Start the API Server
```bash
npm run api:dev
```
Access the API at `http://localhost:4000`. Health check: `http://localhost:4000/health`.

### Start the Website
```bash
npm run dev
```
Access the website at `http://localhost:3000`.

### Start the Admin Dashboard
```bash
npm run dev --workspace=@afc-sear/admin
```
Access the admin panel at `http://localhost:5001`.

## Key Features Integrated

### Event Registration
- **Listing**: `GET /api/v1/public/events/list`
- **Details**: `GET /api/v1/public/events/:slug`
- **Registration**: `POST /api/v1/public/events/:slug/register`

## Troubleshooting

- **Port Conflict**: If you get an `EADDRINUSE` error, check if another instance of the server is running on port 4000, 3000, or 5001.
- **Prisma Client Issues**: Run `npm run db:generate` to synchronize TypeScript types with your database schema.
- **Auth Initialization**: Ensure the API server is started and accessible before performing actions requiring authentication.
