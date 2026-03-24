import type { ApiRouteContract, ServiceBoundary } from '../../contracts/common';

export interface AuthenticatedUserView {
  id: string;
  email: string;
  phone?: string | null;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DEACTIVATED';
  defaultBranchId?: string | null;
  roleKeys: string[];
  branchScopeIds: string[];
}

export interface SessionView {
  id: string;
  deviceLabel?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: string;
}

export interface SignInRequest {
  login: string;
  password: string;
  mfaCode?: string;
}

export interface SignInResponse {
  user: AuthenticatedUserView;
  session: SessionView;
  requiresMfa: boolean;
}

export interface AssignRoleRequest {
  userId: string;
  roleKey: string;
  branchId?: string;
  ministryId?: string;
}

export const identityServiceBoundary: ServiceBoundary = {
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

export const identityRoutes: ApiRouteContract[] = [
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
