# Apostolic Faith Church Platform Implementation Blueprint

## Purpose

This document turns the current church website direction into a build-ready platform plan. The goal is to evolve the public website into a secure, dynamic church operating system that supports:

- public content and publishing
- admin operations
- member and congregant self-service
- events and registrations
- communications
- giving and finance workflows
- branch and ministry administration

The current repository is a Next.js public web application. The long-term target is a shared platform where the public web becomes one surface on top of a common backend and admin system.

## Product Vision

The final product should support the full church lifecycle:

- discover the church
- read and watch content
- register for events
- give and receive receipts
- receive ministry communications
- manage member profiles and households
- coordinate branch and ministry operations
- run finance, reporting, and approvals securely

## Target Platform Shape

Recommended monorepo layout:

```text
apps/
  web/          public website
  admin/        admin portal
  portal/       member portal
  api/          backend services / BFF
  worker/       background jobs
packages/
  ui/           shared design system
  db/           schema, migrations, seeders
  auth/         auth, roles, guards
  workflows/    approval and business workflows
  types/        shared contracts
  config/       environment and app config
docs/
  platform-implementation-blueprint.md
```

Recommended infrastructure:

- frontend: Next.js
- backend services: Node.js with TypeScript
- database: PostgreSQL
- cache and queues: Redis
- file storage: S3-compatible object storage
- search: Meilisearch first, OpenSearch later if needed
- auth: Keycloak, Auth0, or Clerk with MFA and RBAC
- observability: Sentry, logs, metrics, uptime checks
- messaging: email, SMS, WhatsApp integrations
- payments: PSP integrations only, not self-managed card processing

## Implementation Principles

- every privileged action must be audited
- every domain object must carry branch or scope ownership where relevant
- every write path must validate permissions at the service layer
- every external integration must be retryable and observable
- every frontend should consume presentation-ready APIs, not raw tables
- finance and communications must support approvals and traceability
- people and households should be canonical, not duplicated across features

## Database Domain Model

### Shared Table Conventions

Use these fields widely across tables:

- `id uuid primary key`
- `created_at timestamptz`
- `updated_at timestamptz`
- `created_by uuid nullable`
- `updated_by uuid nullable`
- `branch_id uuid nullable`
- `status varchar nullable`
- `metadata jsonb default '{}'`

Use soft delete only where recovery is important. Use append-only logs for audit and finance-sensitive domains.

### Identity and Access

#### `users`
- `id`
- `email`
- `phone`
- `password_hash nullable`
- `is_active`
- `last_login_at`
- `default_branch_id`

#### `roles`
- `id`
- `key`
- `name`
- `description`

#### `permissions`
- `id`
- `key`
- `name`
- `domain`

#### `user_roles`
- `id`
- `user_id`
- `role_id`
- `branch_id nullable`
- `ministry_id nullable`

#### `sessions`
- `id`
- `user_id`
- `device_label`
- `ip_address`
- `user_agent`
- `expires_at`

#### `mfa_methods`
- `id`
- `user_id`
- `type`
- `secret_ref`
- `is_verified`

#### `audit_logs`
- `id`
- `actor_user_id`
- `action`
- `domain`
- `entity_type`
- `entity_id`
- `before jsonb`
- `after jsonb`
- `ip_address`

Key relationships:

- one user has many roles
- one user has many sessions
- one user has many mfa methods
- audit logs link users to all sensitive actions

### Organization

#### `regions`
- `id`
- `name`
- `code`

#### `countries`
- `id`
- `region_id`
- `name`
- `code`
- `currency_code`
- `timezone`

#### `branches`
- `id`
- `country_id`
- `name`
- `slug`
- `type`
- `email`
- `phone`
- `address_line_1`
- `city`
- `latitude`
- `longitude`
- `is_public`

#### `ministries`
- `id`
- `branch_id nullable`
- `name`
- `slug`
- `description`
- `visibility`

### People and Households

#### `people`
- `id`
- `first_name`
- `last_name`
- `middle_name nullable`
- `preferred_name nullable`
- `email nullable`
- `phone nullable`
- `date_of_birth nullable`
- `gender nullable`
- `branch_id nullable`
- `lifecycle_stage`

#### `households`
- `id`
- `branch_id`
- `display_name`
- `primary_contact_person_id nullable`
- `address_line_1 nullable`
- `city nullable`

#### `household_members`
- `id`
- `household_id`
- `person_id`
- `relationship_type`
- `is_primary_contact`

#### `member_profiles`
- `id`
- `person_id`
- `membership_status`
- `joined_branch_id`
- `joined_on nullable`
- `baptized_on nullable`
- `sanctified_on nullable`

#### `visitor_profiles`
- `id`
- `person_id`
- `first_visit_on nullable`
- `source nullable`
- `follow_up_status`

#### `communication_preferences`
- `id`
- `person_id`
- `email_opt_in`
- `sms_opt_in`
- `whatsapp_opt_in`
- `push_opt_in`
- `language nullable`

### Content and Publishing

#### `content_types`
- `id`
- `key`
- `name`

#### `content_items`
- `id`
- `content_type_id`
- `title`
- `slug`
- `summary nullable`
- `status`
- `branch_id nullable`
- `author_user_id nullable`
- `published_at nullable`
- `scheduled_for nullable`

#### `content_versions`
- `id`
- `content_item_id`
- `version_number`
- `body jsonb`
- `seo jsonb`
- `change_note nullable`
- `created_by`

#### `categories`
- `id`
- `name`
- `slug`

#### `tags`
- `id`
- `name`
- `slug`

#### `content_item_categories`
- `id`
- `content_item_id`
- `category_id`

#### `content_item_tags`
- `id`
- `content_item_id`
- `tag_id`

#### `media_assets`
- `id`
- `storage_key`
- `original_name`
- `mime_type`
- `file_size`
- `width nullable`
- `height nullable`
- `uploaded_by`
- `scan_status`

#### `approval_requests`
- `id`
- `domain`
- `entity_type`
- `entity_id`
- `requested_by`
- `assigned_to nullable`
- `status`
- `decision_note nullable`

### Events and Registrations

#### `venues`
- `id`
- `branch_id nullable`
- `name`
- `address_line_1`
- `city`
- `capacity nullable`
- `is_virtual`

#### `events`
- `id`
- `branch_id nullable`
- `title`
- `slug`
- `summary nullable`
- `description jsonb`
- `event_type`
- `visibility`
- `status`
- `venue_id nullable`
- `registration_mode`

#### `event_schedules`
- `id`
- `event_id`
- `starts_at`
- `ends_at`
- `timezone`
- `recurrence_rule nullable`
- `virtual_join_url nullable`

#### `registration_forms`
- `id`
- `event_id`
- `schema jsonb`
- `status`

#### `ticket_types`
- `id`
- `event_id`
- `name`
- `price_minor`
- `currency_code`
- `capacity nullable`

#### `registrations`
- `id`
- `event_id`
- `person_id nullable`
- `household_id nullable`
- `status`
- `total_minor`
- `currency_code`
- `payment_status`

#### `registration_attendees`
- `id`
- `registration_id`
- `person_id nullable`
- `full_name`
- `ticket_type_id nullable`
- `check_in_status`

#### `check_ins`
- `id`
- `event_id`
- `registration_attendee_id`
- `checked_in_at`
- `checked_in_by`

### Communications

#### `announcements`
- `id`
- `branch_id nullable`
- `title`
- `body jsonb`
- `visibility`
- `published_at nullable`

#### `campaigns`
- `id`
- `name`
- `channel`
- `audience_filter jsonb`
- `status`
- `scheduled_for nullable`

#### `message_templates`
- `id`
- `channel`
- `key`
- `subject nullable`
- `body`

#### `message_recipients`
- `id`
- `campaign_id`
- `person_id`
- `delivery_status`

#### `delivery_logs`
- `id`
- `channel`
- `provider`
- `person_id nullable`
- `campaign_id nullable`
- `external_message_id nullable`
- `status`
- `error_message nullable`

#### `subscription_topics`
- `id`
- `key`
- `name`
- `description`

### Finance

#### `funds`
- `id`
- `branch_id nullable`
- `name`
- `code`
- `is_restricted`

#### `payments`
- `id`
- `person_id nullable`
- `branch_id nullable`
- `provider`
- `provider_reference`
- `amount_minor`
- `currency_code`
- `status`
- `captured_at nullable`

#### `donations`
- `id`
- `payment_id`
- `fund_id`
- `person_id nullable`
- `household_id nullable`
- `donated_at`

#### `pledges`
- `id`
- `person_id`
- `fund_id`
- `amount_minor`
- `currency_code`
- `starts_on`
- `ends_on nullable`

#### `receipts`
- `id`
- `payment_id`
- `receipt_number`
- `issued_at`
- `delivery_status`

#### `refunds`
- `id`
- `payment_id`
- `amount_minor`
- `reason`
- `status`
- `approved_by nullable`

#### `reconciliation_batches`
- `id`
- `provider`
- `batch_reference`
- `status`
- `opened_at`
- `closed_at nullable`

### Operations and Care

#### `attendance_records`
- `id`
- `person_id`
- `branch_id`
- `event_id nullable`
- `attended_on`
- `attendance_type`

#### `prayer_requests`
- `id`
- `person_id nullable`
- `branch_id nullable`
- `request_text`
- `visibility`
- `status`

#### `pastoral_notes`
- `id`
- `person_id`
- `author_user_id`
- `note_text`
- `visibility`

#### `tasks`
- `id`
- `branch_id nullable`
- `title`
- `description nullable`
- `assigned_to nullable`
- `status`
- `due_at nullable`

#### `documents`
- `id`
- `branch_id nullable`
- `title`
- `storage_key`
- `visibility`
- `expires_at nullable`

## Core Relationships

- one branch has many ministries, events, people, funds, announcements
- one person may belong to one household and have one member profile or visitor profile
- one event has many schedules, ticket types, registrations, and check-ins
- one content item has many versions and many media references
- one payment may back a donation, an event registration, or both via allocations
- one campaign has many message recipients and delivery logs

## Service Boundaries

### 1. Identity Service

Responsibilities:

- authentication
- MFA
- session lifecycle
- role and permission evaluation
- branch and ministry scoping
- audit initiation

Owns tables:

- `users`
- `roles`
- `permissions`
- `user_roles`
- `sessions`
- `mfa_methods`

### 2. Organization Service

Responsibilities:

- region, country, branch, ministry directory
- branch visibility
- branch-specific settings

Owns tables:

- `regions`
- `countries`
- `branches`
- `ministries`

### 3. People Service

Responsibilities:

- people and household records
- membership and visitor lifecycle
- communication preferences
- attendance history
- pastoral care references

Owns tables:

- `people`
- `households`
- `household_members`
- `member_profiles`
- `visitor_profiles`
- `communication_preferences`
- `attendance_records`
- `prayer_requests`
- `pastoral_notes`

### 4. Content Service

Responsibilities:

- content modeling and lifecycle
- media uploads and moderation
- scheduled publishing
- frontend read models
- tagging and categorization

Owns tables:

- `content_types`
- `content_items`
- `content_versions`
- `categories`
- `tags`
- `content_item_categories`
- `content_item_tags`
- `media_assets`
- `approval_requests` for content flows

### 5. Events Service

Responsibilities:

- event CRUD
- schedules and venues
- registration forms
- ticketing and attendee management
- check-in and capacity

Owns tables:

- `venues`
- `events`
- `event_schedules`
- `registration_forms`
- `ticket_types`
- `registrations`
- `registration_attendees`
- `check_ins`

### 6. Communications Service

Responsibilities:

- announcements
- messaging templates
- campaigns
- recipient resolution
- delivery tracking

Owns tables:

- `announcements`
- `campaigns`
- `message_templates`
- `message_recipients`
- `delivery_logs`
- `subscription_topics`

### 7. Finance Service

Responsibilities:

- donation and payment recording
- receipts
- refunds and approvals
- reconciliation batches
- finance exports

Owns tables:

- `funds`
- `payments`
- `donations`
- `pledges`
- `receipts`
- `refunds`
- `reconciliation_batches`

### 8. Workflow Service

Responsibilities:

- approval routing
- task assignment
- audit enrichment
- notifications tied to business actions

Owns tables:

- `tasks`
- `approval_requests` for non-content flows

## API Contract Outline

### API Standards

- base path: `/api/v1`
- authentication: bearer tokens or server sessions
- admin APIs require RBAC checks
- all list endpoints support `page`, `pageSize`, `sort`, `filter`
- all write endpoints return entity plus status metadata
- idempotency key required for payment and registration submission endpoints
- webhook endpoints validate signatures and log retries

### Public Web APIs

#### `GET /api/v1/public/navigation`
Returns published navigation groups and labels.

#### `GET /api/v1/public/pages/:slug`
Returns published page payload with presentation-ready sections.

#### `GET /api/v1/public/news`
Returns published news list with filters.

#### `GET /api/v1/public/events`
Returns public event cards and schedules.

#### `GET /api/v1/public/events/:slug`
Returns full event detail with registration state.

#### `GET /api/v1/public/branches`
Returns public branch directory data.

#### `GET /api/v1/public/media`
Returns published sermons, recordings, and media assets.

Example response shape:

```json
{
  "data": {
    "id": "evt_123",
    "title": "Regional Camp Meeting",
    "summary": "December gathering and worship services",
    "schedules": [
      {
        "startsAt": "2026-12-03T18:00:00Z",
        "timezone": "Africa/Harare",
        "venueLabel": "Harare"
      }
    ],
    "registration": {
      "enabled": true,
      "mode": "open",
      "startsAt": "2026-10-01T00:00:00Z"
    }
  }
}
```

### Member Portal APIs

#### `GET /api/v1/me`
Returns current user, linked person, branch scopes, and roles.

#### `PATCH /api/v1/me/profile`
Updates member profile details.

#### `GET /api/v1/me/household`
Returns household and members.

#### `GET /api/v1/me/registrations`
Returns registration history.

#### `GET /api/v1/me/giving`
Returns donation and receipt history.

#### `GET /api/v1/me/announcements`
Returns announcements visible to the current member.

#### `POST /api/v1/me/prayer-requests`
Creates a prayer request scoped by visibility.

### Admin Content APIs

#### `GET /api/v1/admin/content-items`
List all content items with status and author.

#### `POST /api/v1/admin/content-items`
Create content item.

#### `POST /api/v1/admin/content-items/:id/versions`
Create draft version.

#### `POST /api/v1/admin/content-items/:id/submit`
Submit for approval.

#### `POST /api/v1/admin/content-items/:id/publish`
Publish immediately.

#### `POST /api/v1/admin/media-assets`
Create upload request and asset record.

### Admin Event APIs

#### `GET /api/v1/admin/events`
#### `POST /api/v1/admin/events`
#### `PATCH /api/v1/admin/events/:id`
#### `POST /api/v1/admin/events/:id/schedules`
#### `POST /api/v1/admin/events/:id/forms`
#### `GET /api/v1/admin/events/:id/registrations`
#### `POST /api/v1/admin/events/:id/check-ins`

### Registration APIs

#### `POST /api/v1/public/events/:eventId/registrations`
Creates a registration.

Request outline:

```json
{
  "householdId": "hh_123",
  "attendees": [
    {
      "personId": "per_123",
      "fullName": "John Doe",
      "ticketTypeId": "tt_1"
    }
  ],
  "answers": {
    "dietaryRequirements": "None"
  }
}
```

#### `POST /api/v1/public/registrations/:registrationId/payments`
Starts payment for paid registrations.

### Communications APIs

#### `POST /api/v1/admin/campaigns`
Create campaign draft.

#### `POST /api/v1/admin/campaigns/:id/preview`
Resolve audience and estimated reach.

#### `POST /api/v1/admin/campaigns/:id/approve`
Approve campaign.

#### `POST /api/v1/admin/campaigns/:id/send`
Queue campaign for delivery.

#### `GET /api/v1/admin/delivery-logs`
Inspect message results.

### Finance APIs

#### `POST /api/v1/public/donations`
Create donation intent.

#### `POST /api/v1/public/payments/webhooks/:provider`
Payment provider webhook endpoint.

#### `GET /api/v1/admin/finance/payments`
#### `GET /api/v1/admin/finance/donations`
#### `POST /api/v1/admin/finance/refunds`
#### `GET /api/v1/admin/finance/reconciliation-batches`

### Internal Eventing

Publish domain events for:

- `content.published`
- `event.created`
- `registration.created`
- `registration.checked_in`
- `campaign.sent`
- `payment.captured`
- `donation.receipted`
- `approval.completed`

Workers consume these for:

- emails and confirmations
- reminders
- receipt generation
- search indexing
- analytics snapshots

## Authorization Model

Role examples:

- super admin
- regional admin
- branch admin
- editor
- events manager
- finance manager
- pastor
- ministry lead
- member

Scoping rules:

- branch admins can only manage their branches
- finance roles cannot edit doctrine or pages by default
- editors cannot access finance data
- pastors can access pastoral care features only for assigned branches or ministries

## Frontend Surface Contracts

### Public Web

- published-only reads
- SEO-friendly content payloads
- lightweight event and media listing models

### Admin Portal

- operational tables
- approval queues
- draft and publish tools
- registration and finance dashboards

### Member Portal

- profile and household
- registrations and receipts
- prayer requests and announcements
- communication preferences

## Execution Plan

Assume 2-week sprints and a focused platform team.

### Sprint 1: Platform Setup

Goals:

- monorepo decision and folder scaffold
- database package scaffold
- auth provider selection
- environment strategy
- CI pipeline and lint, type, test standards

Deliverables:

- repo structure proposal
- package boundaries
- deployment environments
- secrets management approach

### Sprint 2: Identity and Access Foundation

Goals:

- users, roles, permissions schema
- login and session handling
- audit log foundation
- MFA design and initial support

Deliverables:

- auth service shell
- RBAC middleware
- admin login flow

### Sprint 3: Organization and People Base

Goals:

- branch and ministry models
- people and households schema
- membership and visitor profile design
- import strategy for legacy contacts

Deliverables:

- organization service
- people service initial CRUD
- CSV import specification

### Sprint 4: CMS Core

Goals:

- content item and version schema
- media assets
- editor workflow states
- content approval model

Deliverables:

- content service
- admin content list and edit flow
- media upload flow

### Sprint 5: Public Web API Migration

Goals:

- public API for pages, news, branches, events
- presentation read models
- first frontend pages moved from local data to API-backed reads

Deliverables:

- public content endpoints
- initial API consumer layer for web

### Sprint 6: Events Core

Goals:

- events, venues, schedules
- registration forms and ticket types
- event publishing workflow

Deliverables:

- events service
- admin event builder
- public event detail payloads

### Sprint 7: Registration Flow

Goals:

- attendee capture
- confirmation flow
- free registration path
- check-in schema

Deliverables:

- public registration API
- admin registration dashboard

### Sprint 8: Payments and Giving Foundation

Goals:

- payment intent model
- donation model
- provider webhook ingestion
- receipts foundation

Deliverables:

- finance service shell
- donation API
- payment webhook processing

### Sprint 9: Communications Hub

Goals:

- templates
- campaigns
- subscription topics
- delivery logs

Deliverables:

- communications service
- campaign draft and preview workflow

### Sprint 10: Member Portal Foundation

Goals:

- `/me` domain
- profile and household views
- registration history
- donation history

Deliverables:

- member portal base shell
- authenticated member APIs

### Sprint 11: Workflows and Approvals

Goals:

- generic task model
- approval routing
- content, refund, and campaign approvals

Deliverables:

- workflow service
- approval inbox

### Sprint 12: Reporting and Hardening

Goals:

- dashboard read models
- analytics snapshots
- rate limits
- backup verification
- QA regression coverage

Deliverables:

- admin dashboard v1
- platform readiness checklist

## Exit Criteria for MVP

The platform is MVP-ready when:

- admins can log in securely with scoped roles
- public website content is managed from admin tools
- events can be created and published dynamically
- users can register for at least one real event end to end
- donations and receipts work through a PSP integration
- communications can be drafted, approved, sent, and tracked
- member portal shows profile, registrations, and giving history
- audit logs exist for privileged actions

## Immediate Next Build Artifacts

The next documents or code packages to produce should be:

1. database schema draft in Prisma or SQL
2. API contract spec in OpenAPI
3. auth and RBAC matrix
4. admin information architecture
5. migration plan from current static content files into database-backed models
