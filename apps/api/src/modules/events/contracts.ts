import type { ApiRouteContract, ServiceBoundary } from '../../contracts/common';

export interface TicketTypeView {
  id: string;
  name: string;
  priceMinor: number;
  currencyCode: string;
  capacity?: number | null;
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
  registrationMode: 'OPEN' | 'MEMBER_ONLY' | 'INVITATION_ONLY' | 'CLOSED';
  venue?: VenueView | null;
  schedules: EventScheduleView[];
  ticketTypes: TicketTypeView[];
  registrationFormSchema?: any;
}

export interface RegisterForEventRequest {
  personId?: string;
  attendees: Array<{
    fullName: string;
    ticketTypeId: string;
    metadata?: any;
  }>;
  metadata?: any;
}

export interface RegistrationView {
  id: string;
  status: string;
  totalMinor: number;
  currencyCode: string;
  paymentStatus: string;
  createdAt: string;
}

export interface RegistrationAttendeeView {
  id: string;
  fullName: string;
  ticketType: TicketTypeView;
  metadata?: any;
}

export interface AdminRegistrationView extends RegistrationView {
  attendees: RegistrationAttendeeView[];
}

export interface CheckInRequest {
  attendeeId: string;
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
