"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRoutes = exports.eventsServiceBoundary = void 0;
exports.eventsServiceBoundary = {
    domain: 'events',
    responsibilities: [
        'Manage event lifecycle, scheduling, and venues',
        'Handle ticketing and registration flows',
        'Track attendee check-ins and capacity',
    ],
    ownedTables: [
        'venues',
        'events',
        'event_schedules',
        'registration_forms',
        'ticket_types',
        'registrations',
        'registration_attendees',
        'check_ins',
    ],
    publishedEvents: ['event.registration_created', 'event.check_in_recorded'],
    consumedEvents: ['person.updated'],
};
exports.eventRoutes = [
    {
        method: 'GET',
        path: '/api/v1/public/events',
        summary: 'List active and public events',
        auth: 'public',
        responseType: 'EventDetailView[]',
    },
    {
        method: 'GET',
        path: '/api/v1/public/events/:slug',
        summary: 'Get full event details for registration',
        auth: 'public',
        responseType: 'EventDetailView',
    },
    {
        method: 'POST',
        path: '/api/v1/public/events/:slug/register',
        summary: 'Submit a registration request',
        auth: 'public',
        requestType: 'RegisterForEventRequest',
        responseType: 'RegistrationView',
    },
    {
        method: 'GET',
        path: '/api/v1/admin/events/:id/registrations',
        summary: 'List registrations for an event',
        auth: 'admin',
        responseType: 'AdminRegistrationView[]',
    },
    {
        method: 'POST',
        path: '/api/v1/admin/events/:id/check-in',
        summary: 'Record an attendee check-in',
        auth: 'admin',
        requestType: 'CheckInRequest',
        responseType: 'CheckInView',
    },
];
//# sourceMappingURL=contracts.js.map