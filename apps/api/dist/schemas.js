"use strict";
/**
 * JSON schemas for Fastify AJV validation.
 * These mirror the TypeScript contracts in apps/api/src/modules.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrayerRequestSchema = exports.CheckInSchema = exports.AddTicketTypeSchema = exports.AddEventScheduleSchema = exports.UpdateEventSchema = exports.CreateEventSchema = exports.UpdateProfileSchema = exports.CreateDonationIntentSchema = exports.CreateFundSchema = exports.CreateMessageTemplateSchema = exports.CreateCampaignSchema = exports.CreateAnnouncementSchema = exports.UpdateContentItemSchema = exports.CreateContentItemSchema = exports.CreateBranchSchema = exports.RegisterForEventSchema = exports.UpsertPersonSchema = exports.SignInSchema = void 0;
exports.SignInSchema = {
    type: 'object',
    required: ['login', 'password'],
    properties: {
        login: { type: 'string', minLength: 1 },
        password: { type: 'string', minLength: 1 },
    },
};
exports.UpsertPersonSchema = {
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
exports.RegisterForEventSchema = {
    type: 'object',
    required: ['eventId', 'attendees'],
    properties: {
        eventId: { type: 'string', format: 'uuid' },
        attendees: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                required: ['fullName', 'ticketTypeId'],
                properties: {
                    fullName: { type: 'string', minLength: 1 },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    ticketTypeId: { type: 'string', format: 'uuid' },
                },
            },
        },
    },
};
exports.CreateBranchSchema = {
    type: 'object',
    required: ['name'],
    properties: {
        name: { type: 'string', minLength: 1 },
        code: { type: 'string' },
        type: { type: 'string' },
    },
};
exports.CreateContentItemSchema = {
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
exports.UpdateContentItemSchema = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        summary: { type: 'string' },
        body: { type: 'object' },
        visibility: { type: 'string', enum: ['PUBLIC', 'MEMBER', 'BRANCH', 'MINISTRY', 'PRIVATE'] },
        status: { type: 'string', enum: ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] },
    },
};
exports.CreateAnnouncementSchema = {
    type: 'object',
    required: ['title', 'body'],
    properties: {
        title: { type: 'string', minLength: 1 },
        body: { type: 'object' },
        publishedAt: { type: 'string', format: 'date-time' },
        expiresAt: { type: 'string', format: 'date-time' },
    },
};
exports.CreateCampaignSchema = {
    type: 'object',
    required: ['name', 'channel'],
    properties: {
        name: { type: 'string', minLength: 1 },
        channel: { type: 'string', enum: ['EMAIL', 'SMS', 'PUSH'] },
        audienceFilter: { type: 'object' },
        scheduledFor: { type: 'string', format: 'date-time' },
    },
};
exports.CreateMessageTemplateSchema = {
    type: 'object',
    required: ['channel', 'key', 'body'],
    properties: {
        channel: { type: 'string', enum: ['EMAIL', 'SMS', 'PUSH'] },
        key: { type: 'string', minLength: 1 },
        subject: { type: 'string' },
        body: { type: 'string', minLength: 1 },
    },
};
exports.CreateFundSchema = {
    type: 'object',
    required: ['name', 'code'],
    properties: {
        name: { type: 'string', minLength: 1 },
        code: { type: 'string', minLength: 1 },
        isRestricted: { type: 'boolean' },
        branchId: { type: 'string', format: 'uuid' },
    },
};
exports.CreateDonationIntentSchema = {
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
exports.UpdateProfileSchema = {
    type: 'object',
    properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        preferredName: { type: 'string' },
        phone: { type: 'string' },
    },
};
exports.CreateEventSchema = {
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
    },
};
exports.UpdateEventSchema = {
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
    },
};
exports.AddEventScheduleSchema = {
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
exports.AddTicketTypeSchema = {
    type: 'object',
    required: ['name'],
    properties: {
        name: { type: 'string', minLength: 1 },
        priceMinor: { type: 'integer', minimum: 0 },
        currencyCode: { type: 'string' },
        capacity: { type: 'integer' },
    },
};
exports.CheckInSchema = {
    type: 'object',
    required: ['attendeeId'],
    properties: {
        attendeeId: { type: 'string', format: 'uuid' },
    },
};
exports.PrayerRequestSchema = {
    type: 'object',
    required: ['requestText'],
    properties: {
        requestText: { type: 'string', minLength: 1 },
        visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE', 'HIDDEN'] },
    },
};
//# sourceMappingURL=schemas.js.map