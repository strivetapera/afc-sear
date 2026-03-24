# Database Package

This package owns the church platform database schema, migrations, and generated Prisma client.

Initial schema coverage:

- Identity
- Organization
- People
- Content

Planned next domains:

- Events and registrations
- Communications
- Finance
- Workflows and audit enrichments

## Local Database Workflow

From the repository root:

```bash
npm run db:up
npm run db:migrate
npm run db:seed
```

Default local connection:

```bash
postgresql://postgres:postgres@localhost:5433/afc_sear_platform?schema=public
```
