"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peopleRoutes = exports.peopleServiceBoundary = void 0;
exports.peopleServiceBoundary = {
    domain: 'people',
    responsibilities: [
        'Manage person and household records',
        'Track member and visitor lifecycle',
        'Own communication preferences',
        'Prepare the person model for attendance, care, and registrations',
    ],
    ownedTables: [
        'people',
        'households',
        'household_members',
        'member_profiles',
        'visitor_profiles',
        'communication_preferences',
    ],
    publishedEvents: ['people.person_created', 'people.household_updated'],
    consumedEvents: ['identity.user_signed_in', 'organization.branch_updated'],
};
exports.peopleRoutes = [
    {
        method: 'GET',
        path: '/api/v1/admin/people',
        summary: 'List people records with lifecycle metadata',
        auth: 'admin',
        responseType: 'PersonView[]',
    },
    {
        method: 'POST',
        path: '/api/v1/admin/people',
        summary: 'Create or upsert a person record',
        auth: 'admin',
        requestType: 'UpsertPersonRequest',
        responseType: 'PersonView',
    },
    {
        method: 'GET',
        path: '/api/v1/me/household',
        summary: 'Return the authenticated member household',
        auth: 'member',
        responseType: 'HouseholdView',
    },
];
//# sourceMappingURL=contracts.js.map