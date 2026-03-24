import type {
  Branch,
  ContentItem,
  ContentStatus,
  ContentType,
  ContentVersion,
  Person,
  User,
  UserRole,
  VisibilityScope,
} from '@prisma/client';
import type {
  AuthenticatedUserView,
  BranchView,
  ContentItemView,
  ContentVersionView,
  AdminRegistrationView,
  CheckInView,
  EventDetailView,
  EventScheduleView,
  PersonView,
  RegistrationAttendeeView,
  RegistrationView,
  TicketTypeView,
  VenueView,
} from '../modules';

// Existing types...
type UserWithRoles = User & {
  userRoles: Array<
    UserRole & {
      role: {
        key: string;
      };
    }
  >;
};

type ContentItemWithRelations = ContentItem & {
  contentType: Pick<ContentType, 'key'>;
  versions?: ContentVersion[];
};

// Event types...
type EventWithRelations = any; // Will refine once types are stable
type RegistrationWithRelations = any;

function mapContentStatus(status: ContentStatus): ContentItemView['status'] {
  return status;
}

function mapVisibility(visibility: VisibilityScope): ContentItemView['visibility'] {
  return visibility;
}

// ... existing authenticated user, branch, person, content mappers ...

export function toVenueView(venue: any): VenueView {
  return {
    id: venue.id,
    name: venue.name,
    city: venue.city,
    addressLine1: venue.addressLine1,
    isVirtual: venue.isVirtual,
  };
}

export function toTicketTypeView(ticket: any): TicketTypeView {
  return {
    id: ticket.id,
    name: ticket.name,
    priceMinor: ticket.priceMinor,
    currencyCode: ticket.currencyCode,
    capacity: ticket.capacity,
  };
}

export function toEventScheduleView(schedule: any): EventScheduleView {
  return {
    startsAt: schedule.startsAt.toISOString(),
    endsAt: schedule.endsAt.toISOString(),
    timezone: schedule.timezone,
    recurrenceRule: schedule.recurrenceRule,
    virtualJoinUrl: schedule.virtualJoinUrl,
  };
}

export function toEventDetailView(event: any): EventDetailView {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    summary: event.summary,
    description: event.description,
    eventType: event.eventType,
    registrationMode: event.registrationMode,
    venue: event.venue ? toVenueView(event.venue) : null,
    schedules: event.schedules?.map(toEventScheduleView) ?? [],
    ticketTypes: event.ticketTypes?.map(toTicketTypeView) ?? [],
    registrationFormSchema: event.registrationForm?.schema ?? null,
  };
}

export function toRegistrationView(reg: any): RegistrationView {
  return {
    id: reg.id,
    status: reg.status,
    totalMinor: reg.totalMinor,
    currencyCode: reg.currencyCode,
    paymentStatus: reg.paymentStatus,
    createdAt: reg.createdAt.toISOString(),
  };
}

export function toRegistrationAttendeeView(attendee: any): RegistrationAttendeeView {
  return {
    id: attendee.id,
    fullName: attendee.fullName,
    ticketType: toTicketTypeView(attendee.ticketType),
    metadata: attendee.metadata,
  };
}

export function toAdminRegistrationView(reg: any): AdminRegistrationView {
  return {
    ...toRegistrationView(reg),
    attendees: reg.attendees?.map(toRegistrationAttendeeView) ?? [],
  };
}

export function toCheckInView(checkIn: any): CheckInView {
  return {
    id: checkIn.id,
    attendeeId: checkIn.registrationAttendeeId,
    checkedInAt: checkIn.checkedInAt.toISOString(),
  };
}

export function toAuthenticatedUserView(user: UserWithRoles): AuthenticatedUserView {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone ?? null,
    status: user.status,
    defaultBranchId: user.defaultBranchId ?? null,
    roleKeys: user.userRoles.map((item) => item.role.key),
    branchScopeIds: user.userRoles
      .map((item) => item.branchId)
      .filter((value): value is string => Boolean(value)),
  };
}

export function toBranchView(branch: Branch): BranchView {
  return {
    id: branch.id,
    countryId: branch.countryId,
    name: branch.name,
    slug: branch.slug,
    type: branch.type,
    email: branch.email ?? null,
    phone: branch.phone ?? null,
    city: branch.city ?? null,
    isPublic: branch.isPublic,
  };
}

export function toPersonView(person: Person): PersonView {
  return {
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    preferredName: person.preferredName ?? null,
    email: person.email ?? null,
    phone: person.phone ?? null,
    branchId: person.branchId ?? null,
    lifecycleStage: person.lifecycleStage,
  };
}

export function toContentVersionView(version: ContentVersion): ContentVersionView {
  return {
    id: version.id,
    versionNumber: version.versionNumber,
    createdAt: version.createdAt.toISOString(),
    changeNote: version.changeNote ?? null,
  };
}

export function toContentItemView(contentItem: ContentItemWithRelations): ContentItemView {
  return {
    id: contentItem.id,
    contentTypeKey: contentItem.contentType.key,
    branchId: contentItem.branchId ?? null,
    title: contentItem.title,
    slug: contentItem.slug,
    summary: contentItem.summary ?? null,
    status: mapContentStatus(contentItem.status),
    visibility: mapVisibility(contentItem.visibility),
    publishedAt: contentItem.publishedAt?.toISOString() ?? null,
    versions: contentItem.versions?.map(toContentVersionView),
    metadata:
      contentItem.metadata && typeof contentItem.metadata === 'object'
        ? (contentItem.metadata as Record<string, unknown>)
        : null,
  };
}
