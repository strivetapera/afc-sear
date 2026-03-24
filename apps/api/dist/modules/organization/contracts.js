export const organizationServiceBoundary = {
    domain: 'organization',
    responsibilities: [
        'Manage regions, countries, branches, and ministries',
        'Expose public branch directory data',
        'Provide branch-level operational scope to other services',
    ],
    ownedTables: ['regions', 'countries', 'branches', 'ministries'],
    publishedEvents: ['organization.branch_created', 'organization.branch_updated'],
    consumedEvents: [],
};
export const organizationRoutes = [
    {
        method: 'GET',
        path: '/api/v1/public/branches',
        summary: 'List public branch directory entries',
        auth: 'public',
        responseType: 'BranchView[]',
    },
    {
        method: 'GET',
        path: '/api/v1/public/locations-directory',
        summary: 'Return the public locations directory payload shaped for the website',
        auth: 'public',
        responseType: 'LocationsDirectoryView',
    },
    {
        method: 'POST',
        path: '/api/v1/admin/branches',
        summary: 'Create a branch record',
        auth: 'admin',
        requestType: 'CreateBranchRequest',
        responseType: 'BranchView',
    },
    {
        method: 'GET',
        path: '/api/v1/admin/ministries',
        summary: 'List ministries with branch visibility metadata',
        auth: 'admin',
        responseType: 'MinistryView[]',
    },
];
//# sourceMappingURL=contracts.js.map