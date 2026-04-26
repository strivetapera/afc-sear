import type { ApiRouteContract, ServiceBoundary } from '../../contracts/common';

export interface TicketTypeView {
  id: string;
  name: string;
  priceMinor: number;
  currencyCode: string;
  capacity?: number | null;
}

export interface RegistrationInventoryView {
  id: string;
  category: string;
  name: string;
  capacity: number;
  remainingCapacity: number;
  isActive: boolean;
  metadata?: any;
}

export interface RegistrationPolicyView {
  codePrefix: string;
  nextSequence: number;
  paymentDeadline?: string | null;
  cancellationDeadline?: string | null;
  requireFullPaymentForCheckIn: boolean;
  allowWaitlist: boolean;
  allowSelfServiceLookup: boolean;
  supportedChannels?: string[];
  pricingRules?: any[];
  confirmationConfig?: any;
}

export interface EventScheduleView {
  startsAt: string;
  endsAt: string;
  timezone: string;
  recurrenceRule?: string | null;
  virtualJoinUrl?: string | null;
}

export interface VenueView {
  id: string;
  name: string;
  city: string;
  addressLine1: string;
  isVirtual: boolean;
}

export interface EventDetailView {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  description?: any;
  eventType: string;
  visibility?: string;
  status?: string;
  registrationMode: 'OPEN' | 'MEMBER_ONLY' | 'INVITATION_ONLY' | 'CLOSED';
  venue?: VenueView | null;
  schedules: EventScheduleView[];
  ticketTypes: TicketTypeView[];
  registrationFormSchema?: any;
  registrationPolicy?: RegistrationPolicyView | null;
  registrationInventory?: RegistrationInventoryView[];
}

export interface RegisterForEventRequest {
  personId?: string;
  channel?: 'WEB' | 'WHATSAPP' | 'ADMIN' | 'IMPORT';
  contactEmail?: string;
  contactPhone?: string;
  attendees: Array<{
    fullName: string;
    email?: string;
    phone?: string;
    branchName?: string;
    ageGroup?: string;
    ticketTypeId?: string;
    inventoryId?: string;
    metadata?: any;
  }>;
  metadata?: any;
}

export interface RegisterForEventWaitlistRequest {
  channel?: 'WEB' | 'WHATSAPP' | 'ADMIN' | 'IMPORT';
  firstName: string;
  lastName: string;
  branchName?: string;
  ageGroup?: string;
  email?: string;
  phone?: string;
  inventoryId?: string;
  metadata?: any;
}

export interface RegistrationView {
  id: string;
  registrationCode: string;
  status: string;
  totalMinor: number;
  amountPaidMinor: number;
  amountOutstandingMinor: number;
  currencyCode: string;
  paymentStatus: string;
  channel: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  qrCodePayload?: string | null;
  createdAt: string;
}

export interface RegistrationAttendeeView {
  id: string;
  fullName: string;
  inventory?: RegistrationInventoryView | null;
  ticketType?: TicketTypeView | null;
  metadata?: any;
}

export interface AdminRegistrationView extends RegistrationView {
  attendees: RegistrationAttendeeView[];
  receipts?: RegistrationReceiptView[];
}

export interface RegistrationReceiptView {
  id: string;
  receiptNumber: string;
  amountMinor: number;
  currencyCode: string;
  paymentMethod?: string | null;
  note?: string | null;
  receivedAt: string;
}

export interface WaitlistEntryView {
  id: string;
  waitlistCode: string;
  firstName: string;
  lastName: string;
  branchName?: string | null;
  ageGroup?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  inventory?: RegistrationInventoryView | null;
  createdAt: string;
  activatedAt?: string | null;
}

export interface CheckInRequest {
  attendeeId: string;
  overridePaymentBlock?: boolean;
}

export interface CheckInView {
  id: string;
  attendeeId: string;
  checkedInAt: string;
}

export const eventsServiceBoundary: ServiceBoundary = {
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

export const eventRoutes: ApiRouteContract[] = [
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
    method: 'POST',
    path: '/api/v1/public/events/:slug/waitlist',
    summary: 'Join an event waitlist when inventory is full or registration is controlled',
    auth: 'public',
    requestType: 'RegisterForEventWaitlistRequest',
    responseType: 'WaitlistEntryView',
  },
  {
    method: 'GET',
    path: '/api/v1/admin/events/:id/registrations',
    summary: 'List registrations for an event',
    auth: 'admin',
    responseType: 'AdminRegistrationView[]',
  },
  {
    method: 'GET',
    path: '/api/v1/admin/events/:id/waitlist',
    summary: 'List waitlist entries for an event',
    auth: 'admin',
    responseType: 'WaitlistEntryView[]',
  },
  {
    method: 'POST',
    path: '/api/v1/admin/events/:id/registrations/:registrationId/receipts',
    summary: 'Record a partial or full payment receipt for an event registration',
    auth: 'admin',
    requestType: 'RegistrationReceiptView',
    responseType: 'AdminRegistrationView',
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
