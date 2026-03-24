import type { ApiRouteContract, ServiceBoundary } from '../../contracts/common';

export interface PersonView {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  email?: string | null;
  phone?: string | null;
  branchId?: string | null;
  lifecycleStage: 'VISITOR' | 'REGULAR_ATTENDEE' | 'MEMBER' | 'LEADER' | 'STAFF';
}

export interface HouseholdMemberView {
  personId: string;
  fullName: string;
  relationshipType: string;
  isPrimaryContact: boolean;
}

export interface HouseholdView {
  id: string;
  branchId: string;
  displayName: string;
  primaryContactPersonId?: string | null;
  members: HouseholdMemberView[];
}

export interface UpsertPersonRequest {
  firstName: string;
  lastName: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  branchId?: string;
  lifecycleStage?: PersonView['lifecycleStage'];
}

export const peopleServiceBoundary: ServiceBoundary = {
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

export const peopleRoutes: ApiRouteContract[] = [
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
