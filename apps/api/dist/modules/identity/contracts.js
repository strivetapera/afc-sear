"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityRoutes = exports.identityServiceBoundary = void 0;
exports.identityServiceBoundary = {
    domain: 'identity',
    responsibilities: [
        'Authenticate privileged and member users',
        'Manage sessions and MFA enrollment',
        'Resolve roles, permissions, and branch-scoped access',
        'Emit audit context for privileged actions',
    ],
    ownedTables: [
        'users',
        'roles',
        'permissions',
        'role_permissions',
        'user_roles',
        'sessions',
        'mfa_methods',
        'audit_logs',
    ],
    publishedEvents: ['identity.user_signed_in', 'identity.role_assigned'],
    consumedEvents: ['organization.branch_deleted'],
};
exports.identityRoutes = [
    {
        method: 'POST',
        path: '/api/v1/auth/sign-in',
        summary: 'Authenticate a user and create a session',
        auth: 'public',
        requestType: 'SignInRequest',
        responseType: 'SignInResponse',
    },
    {
        method: 'GET',
        path: '/api/v1/me',
        summary: 'Return the authenticated user identity and scope',
        auth: 'member',
        responseType: 'AuthenticatedUserView',
    },
    {
        method: 'POST',
        path: '/api/v1/admin/identity/assign-role',
        summary: 'Assign a role within optional branch or ministry scope',
        auth: 'admin',
        requestType: 'AssignRoleRequest',
        responseType: 'AuthenticatedUserView',
    },
];
//# sourceMappingURL=contracts.js.map