/**
 * JSON schemas for Fastify AJV validation.
 * These mirror the TypeScript contracts in apps/api/src/modules.
 */

export const SignInSchema = {
  type: 'object',
  required: ['login', 'password'],
  properties: {
    login: { type: 'string', minLength: 1 },
    password: { type: 'string', minLength: 1 },
  },
};

export const UpsertPersonSchema = {
  type: 'object',
  required: ['firstName', 'lastName'],
  properties: {
    firstName: { type: 'string', minLength: 1 },
    lastName: { type: 'string', minLength: 1 },
    middleName: { type: 'string' },
    preferredName: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] },
    birthDate: { type: 'string', format: 'date-time' },
    maritalStatus: { type: 'string' },
  },
};

export const RegisterForEventSchema = {
  type: 'object',
  required: ['attendees'],
  properties: {
    channel: { type: 'string', enum: ['WEB', 'WHATSAPP', 'ADMIN', 'IMPORT'] },
    contactEmail: { type: 'string', format: 'email' },
    contactPhone: { type: 'string' },
    attendees: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['fullName'],
        properties: {
          fullName: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          branchName: { type: 'string' },
          ageGroup: { type: 'string' },
          ticketTypeId: { type: 'string', format: 'uuid' },
          inventoryId: { type: 'string', format: 'uuid' },
          metadata: { type: 'object' },
        },
      },
    },
    metadata: { type: 'object' },
  },
};

export const RegisterForEventWaitlistSchema = {
  type: 'object',
  required: ['firstName', 'lastName'],
  properties: {
    channel: { type: 'string', enum: ['WEB', 'WHATSAPP', 'ADMIN', 'IMPORT'] },
    firstName: { type: 'string', minLength: 1 },
    lastName: { type: 'string', minLength: 1 },
    branchName: { type: 'string' },
    ageGroup: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    inventoryId: { type: 'string', format: 'uuid' },
    metadata: { type: 'object' },
  },
};

export const CreateBranchSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1 },
    code: { type: 'string' },
    type: { type: 'string' },
  },
};

export const CreateContentItemSchema = {
  type: 'object',
  required: ['title', 'contentTypeKey'],
  properties: {
    title: { type: 'string', minLength: 1 },
    contentTypeKey: { type: 'string' },
    branchId: { type: 'string', format: 'uuid' },
    slug: { type: 'string' },
    summary: { type: 'string' },
    visibility: { type: 'string', enum: ['PUBLIC', 'MEMBER', 'BRANCH', 'MINISTRY', 'PRIVATE'] },
  },
};

export const UpdateContentItemSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    body: { type: 'object' },
    visibility: { type: 'string', enum: ['PUBLIC', 'MEMBER', 'BRANCH', 'MINISTRY', 'PRIVATE'] },
    status: { type: 'string', enum: ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] },
  },
};

export const CreateAnnouncementSchema = {
  type: 'object',
  required: ['title', 'body'],
  properties: {
    title: { type: 'string', minLength: 1 },
    body: { type: 'object' },
    publishedAt: { type: 'string', format: 'date-time' },
    expiresAt: { type: 'string', format: 'date-time' },
  },
};

export const CreateCampaignSchema = {
  type: 'object',
  required: ['name', 'channel'],
  properties: {
    name: { type: 'string', minLength: 1 },
    channel: { type: 'string', enum: ['EMAIL', 'SMS', 'PUSH'] },
    audienceFilter: { type: 'object' },
    scheduledFor: { type: 'string', format: 'date-time' },
  },
};

export const CreateMessageTemplateSchema = {
  type: 'object',
  required: ['channel', 'key', 'body'],
  properties: {
    channel: { type: 'string', enum: ['EMAIL', 'SMS', 'PUSH'] },
    key: { type: 'string', minLength: 1 },
    subject: { type: 'string' },
    body: { type: 'string', minLength: 1 },
  },
};

export const CreateFundSchema = {
  type: 'object',
  required: ['name', 'code'],
  properties: {
    name: { type: 'string', minLength: 1 },
    code: { type: 'string', minLength: 1 },
    isRestricted: { type: 'boolean' },
    branchId: { type: 'string', format: 'uuid' },
  },
};

export const CreateDonationIntentSchema = {
  type: 'object',
  required: ['fundId', 'amountMinor', 'currencyCode'],
  properties: {
    fundId: { type: 'string', format: 'uuid' },
    amountMinor: { type: 'integer', minimum: 1 },
    currencyCode: { type: 'string', minLength: 3, maxLength: 3 },
    personId: { type: 'string', format: 'uuid' },
    householdId: { type: 'string', format: 'uuid' },
  },
};

export const UpdateProfileSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    preferredName: { type: 'string' },
    phone: { type: 'string' },
  },
};

export const CreateEventSchema = {
  type: 'object',
  required: ['title', 'slug'],
  properties: {
    title: { type: 'string', minLength: 1 },
    slug: { type: 'string', minLength: 1 },
    summary: { type: 'string' },
    description: { type: 'object' },
    eventType: { type: 'string' },
    visibility: { type: 'string' },
    registrationMode: { type: 'string' },
    branchId: { type: 'string', format: 'uuid' },
    venueId: { type: 'string', format: 'uuid' },
    registrationFormSchema: { type: 'object' },
    registrationPolicy: {
      type: 'object',
      properties: {
        codePrefix: { type: 'string' },
        paymentDeadline: { type: 'string', format: 'date-time' },
        cancellationDeadline: { type: 'string', format: 'date-time' },
        requireFullPaymentForCheckIn: { type: 'boolean' },
        allowWaitlist: { type: 'boolean' },
        allowSelfServiceLookup: { type: 'boolean' },
        supportedChannels: { type: 'array', items: { type: 'string' } },
        pricingRules: { type: 'array', items: { type: 'object' } },
        confirmationConfig: { type: 'object' },
      },
    },
    registrationInventory: {
      type: 'array',
      items: {
        type: 'object',
        required: ['category', 'name', 'capacity'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          category: { type: 'string' },
          name: { type: 'string' },
          capacity: { type: 'integer', minimum: 0 },
          isActive: { type: 'boolean' },
          metadata: { type: 'object' },
        },
      },
    },
  },
};

export const UpdateEventSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    slug: { type: 'string' },
    summary: { type: 'string' },
    description: { type: 'object' },
    eventType: { type: 'string' },
    visibility: { type: 'string' },
    registrationMode: { type: 'string' },
    status: { type: 'string' },
    venueId: { type: 'string', format: 'uuid' },
    registrationFormSchema: { type: 'object' },
    registrationPolicy: {
      type: 'object',
      properties: {
        codePrefix: { type: 'string' },
        paymentDeadline: { type: 'string', format: 'date-time' },
        cancellationDeadline: { type: 'string', format: 'date-time' },
        requireFullPaymentForCheckIn: { type: 'boolean' },
        allowWaitlist: { type: 'boolean' },
        allowSelfServiceLookup: { type: 'boolean' },
        supportedChannels: { type: 'array', items: { type: 'string' } },
        pricingRules: { type: 'array', items: { type: 'object' } },
        confirmationConfig: { type: 'object' },
      },
    },
    registrationInventory: {
      type: 'array',
      items: {
        type: 'object',
        required: ['category', 'name', 'capacity'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          category: { type: 'string' },
          name: { type: 'string' },
          capacity: { type: 'integer', minimum: 0 },
          isActive: { type: 'boolean' },
          metadata: { type: 'object' },
        },
      },
    },
  },
};

export const AddEventScheduleSchema = {
  type: 'object',
  required: ['startsAt', 'endsAt', 'timezone'],
  properties: {
    startsAt: { type: 'string', format: 'date-time' },
    endsAt: { type: 'string', format: 'date-time' },
    timezone: { type: 'string' },
    recurrenceRule: { type: 'string' },
    virtualJoinUrl: { type: 'string' },
  },
};

export const AddTicketTypeSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1 },
    priceMinor: { type: 'integer', minimum: 0 },
    currencyCode: { type: 'string' },
    capacity: { type: 'integer' },
  },
};

export const CheckInSchema = {
  type: 'object',
  required: ['attendeeId'],
  properties: {
    attendeeId: { type: 'string', format: 'uuid' },
    overridePaymentBlock: { type: 'boolean' },
  },
};

export const AddRegistrationReceiptSchema = {
  type: 'object',
  required: ['amountMinor', 'receiptNumber'],
  properties: {
    receiptNumber: { type: 'string', minLength: 1 },
    amountMinor: { type: 'integer', minimum: 1 },
    currencyCode: { type: 'string', minLength: 3, maxLength: 3 },
    paymentMethod: { type: 'string' },
    note: { type: 'string' },
    receivedAt: { type: 'string', format: 'date-time' },
  },
};

export const PrayerRequestSchema = {
  type: 'object',
  required: ['requestText'],
  properties: {
    requestText: { type: 'string', minLength: 1 },
    visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE', 'HIDDEN'] },
  },
};
