-- CreateEnum
CREATE TYPE "RegistrationChannel" AS ENUM ('WEB', 'WHATSAPP', 'ADMIN', 'IMPORT');

-- CreateEnum
CREATE TYPE "WaitlistEntryStatus" AS ENUM ('WAITING', 'ACTIVATED', 'CONVERTED', 'CANCELLED', 'EXPIRED');

-- AlterTable
ALTER TABLE "registrations"
ADD COLUMN     "amount_paid_minor" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "channel" "RegistrationChannel" NOT NULL DEFAULT 'WEB',
ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ADD COLUMN     "qr_code_payload" TEXT,
ADD COLUMN     "registration_code" TEXT;

-- AlterTable
ALTER TABLE "registration_attendees" ADD COLUMN     "inventory_id" UUID;

-- CreateTable
CREATE TABLE "event_registration_policies" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "code_prefix" TEXT NOT NULL,
    "next_sequence" INTEGER NOT NULL DEFAULT 1,
    "next_waitlist_sequence" INTEGER NOT NULL DEFAULT 1,
    "payment_deadline" TIMESTAMP(3),
    "cancellation_deadline" TIMESTAMP(3),
    "require_full_payment_for_check_in" BOOLEAN NOT NULL DEFAULT false,
    "allow_waitlist" BOOLEAN NOT NULL DEFAULT false,
    "allow_self_service_lookup" BOOLEAN NOT NULL DEFAULT true,
    "supportedChannels" JSONB,
    "pricingRules" JSONB,
    "confirmation_config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_registration_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registration_inventory" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_registration_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_receipts" (
    "id" UUID NOT NULL,
    "registration_id" UUID NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "currency_code" TEXT NOT NULL DEFAULT 'USD',
    "payment_method" TEXT,
    "note" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL,
    "recorded_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registration_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_waitlist_entries" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "inventory_id" UUID,
    "converted_registration_id" UUID,
    "waitlist_code" TEXT NOT NULL,
    "channel" "RegistrationChannel" NOT NULL DEFAULT 'WEB',
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "branch_name" TEXT,
    "age_group" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "metadata" JSONB,
    "status" "WaitlistEntryStatus" NOT NULL DEFAULT 'WAITING',
    "activated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_registration_policies_event_id_key" ON "event_registration_policies"("event_id");

-- CreateIndex
CREATE INDEX "event_registration_inventory_event_id_idx" ON "event_registration_inventory"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_registration_inventory_event_id_category_name_key" ON "event_registration_inventory"("event_id", "category", "name");

-- CreateIndex
CREATE UNIQUE INDEX "registration_receipts_receipt_number_key" ON "registration_receipts"("receipt_number");

-- CreateIndex
CREATE INDEX "registration_receipts_registration_id_idx" ON "registration_receipts"("registration_id");

-- CreateIndex
CREATE INDEX "registration_receipts_recorded_by_id_idx" ON "registration_receipts"("recorded_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "registration_waitlist_entries_converted_registration_id_key" ON "registration_waitlist_entries"("converted_registration_id");

-- CreateIndex
CREATE UNIQUE INDEX "registration_waitlist_entries_waitlist_code_key" ON "registration_waitlist_entries"("waitlist_code");

-- CreateIndex
CREATE INDEX "registration_waitlist_entries_event_id_idx" ON "registration_waitlist_entries"("event_id");

-- CreateIndex
CREATE INDEX "registration_waitlist_entries_inventory_id_idx" ON "registration_waitlist_entries"("inventory_id");

-- Backfill existing registrations before enforcing the new identifier constraint.
UPDATE "registrations"
SET "registration_code" = CONCAT(
  'REG-',
  EXTRACT(YEAR FROM CURRENT_DATE)::text,
  '-',
  SUBSTRING(REPLACE("id"::text, '-', '') FROM 1 FOR 8)
)
WHERE "registration_code" IS NULL;

-- Ensure the new registration code is required after backfill.
ALTER TABLE "registrations"
ALTER COLUMN "registration_code" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "registrations_registration_code_key" ON "registrations"("registration_code");

-- CreateIndex
CREATE INDEX "registration_attendees_inventory_id_idx" ON "registration_attendees"("inventory_id");

-- AddForeignKey
ALTER TABLE "event_registration_policies" ADD CONSTRAINT "event_registration_policies_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registration_inventory" ADD CONSTRAINT "event_registration_inventory_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_attendees" ADD CONSTRAINT "registration_attendees_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "event_registration_inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_receipts" ADD CONSTRAINT "registration_receipts_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_receipts" ADD CONSTRAINT "registration_receipts_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_waitlist_entries" ADD CONSTRAINT "registration_waitlist_entries_converted_registration_id_fkey" FOREIGN KEY ("converted_registration_id") REFERENCES "registrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_waitlist_entries" ADD CONSTRAINT "registration_waitlist_entries_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_waitlist_entries" ADD CONSTRAINT "registration_waitlist_entries_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "event_registration_inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
