# API Scaffold

This workspace is reserved for the platform backend and service layer.

Current scaffolding included in this workspace:

- domain contracts for `identity`, `organization`, `people`, and `content`
- shared API contract types
- initial OpenAPI specification at `openapi/openapi.yaml`
- runnable Fastify scaffold with seeded in-memory routes

Seeded local sign-in credentials for the API scaffold:

- login: `admin@apostolicfaith.example`
- password: `changeme-admin`

Planned responsibilities:

- public read APIs
- admin write APIs
- member portal APIs
- authentication and RBAC integration
- workflow orchestration
- webhook handling
