import type { ApiRouteContract, ServiceBoundary } from '../../contracts/common';

export interface BranchView {
  id: string;
  countryId: string;
  name: string;
  slug: string;
  type: string;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  isPublic: boolean;
}

export interface CreateBranchRequest {
  countryId: string;
  name: string;
  slug: string;
  type: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
}

export interface MinistryView {
  id: string;
  branchId?: string | null;
  name: string;
  slug: string;
  visibility: 'PUBLIC' | 'MEMBER' | 'PRIVATE';
}

export interface LocationsDirectoryContactView {
  id: string;
  label: string;
  value: string;
  href?: string;
  note: string;
}

export interface LocationsDirectoryEntryView {
  id: string;
  country: string;
  city: string;
  congregation: string;
  address: string;
  serviceTimes: string[];
  contact: string;
  pastor: string;
  notes: string;
  livestream: boolean;
}

export interface LocationsDirectoryGroupView {
  country: string;
  locations: LocationsDirectoryEntryView[];
}

export interface LocationsDirectoryView {
  metadata: {
    eyebrow: string;
    title: string;
    lead: string;
  };
  overview: {
    intro: string;
    contactPrompt: string;
  };
  contacts: LocationsDirectoryContactView[];
  groupedLocations: LocationsDirectoryGroupView[];
}

export const organizationServiceBoundary: ServiceBoundary = {
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

export const organizationRoutes: ApiRouteContract[] = [
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
