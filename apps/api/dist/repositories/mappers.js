"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toVenueView = toVenueView;
exports.toTicketTypeView = toTicketTypeView;
exports.toEventScheduleView = toEventScheduleView;
exports.toEventDetailView = toEventDetailView;
exports.toRegistrationView = toRegistrationView;
exports.toRegistrationAttendeeView = toRegistrationAttendeeView;
exports.toAdminRegistrationView = toAdminRegistrationView;
exports.toCheckInView = toCheckInView;
exports.toAuthenticatedUserView = toAuthenticatedUserView;
exports.toBranchView = toBranchView;
exports.toPersonView = toPersonView;
exports.toContentVersionView = toContentVersionView;
exports.toContentItemView = toContentItemView;
function mapContentStatus(status) {
    return status;
}
function mapVisibility(visibility) {
    return visibility;
}
// ... existing authenticated user, branch, person, content mappers ...
function toVenueView(venue) {
    return {
        id: venue.id,
        name: venue.name,
        city: venue.city,
        addressLine1: venue.addressLine1,
        isVirtual: venue.isVirtual,
    };
}
function toTicketTypeView(ticket) {
    return {
        id: ticket.id,
        name: ticket.name,
        priceMinor: ticket.priceMinor,
        currencyCode: ticket.currencyCode,
        capacity: ticket.capacity,
    };
}
function toEventScheduleView(schedule) {
    return {
        startsAt: schedule.startsAt.toISOString(),
        endsAt: schedule.endsAt.toISOString(),
        timezone: schedule.timezone,
        recurrenceRule: schedule.recurrenceRule,
        virtualJoinUrl: schedule.virtualJoinUrl,
    };
}
function toEventDetailView(event) {
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
function toRegistrationView(reg) {
    return {
        id: reg.id,
        status: reg.status,
        totalMinor: reg.totalMinor,
        currencyCode: reg.currencyCode,
        paymentStatus: reg.paymentStatus,
        createdAt: reg.createdAt.toISOString(),
    };
}
function toRegistrationAttendeeView(attendee) {
    return {
        id: attendee.id,
        fullName: attendee.fullName,
        ticketType: toTicketTypeView(attendee.ticketType),
        metadata: attendee.metadata,
    };
}
function toAdminRegistrationView(reg) {
    return {
        ...toRegistrationView(reg),
        attendees: reg.attendees?.map(toRegistrationAttendeeView) ?? [],
    };
}
function toCheckInView(checkIn) {
    return {
        id: checkIn.id,
        attendeeId: checkIn.registrationAttendeeId,
        checkedInAt: checkIn.checkedInAt.toISOString(),
    };
}
function toAuthenticatedUserView(user) {
    return {
        id: user.id,
        email: user.email,
        phone: user.phone ?? null,
        status: user.status,
        defaultBranchId: user.defaultBranchId ?? null,
        roleKeys: user.userRoles.map((item) => item.role.key),
        branchScopeIds: user.userRoles
            .map((item) => item.branchId)
            .filter((value) => Boolean(value)),
    };
}
function toBranchView(branch) {
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
function toPersonView(person) {
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
function toContentVersionView(version) {
    return {
        id: version.id,
        versionNumber: version.versionNumber,
        createdAt: version.createdAt.toISOString(),
        changeNote: version.changeNote ?? null,
    };
}
function toContentItemView(contentItem) {
    const latestBody = contentItem.versions?.[0]?.body;
    return {
        id: contentItem.id,
        contentTypeKey: contentItem.contentType.key,
        branchId: contentItem.branchId ?? null,
        title: contentItem.title,
        slug: contentItem.slug,
        summary: contentItem.summary ?? null,
        createdAt: contentItem.createdAt.toISOString(),
        updatedAt: contentItem.updatedAt.toISOString(),
        status: mapContentStatus(contentItem.status),
        visibility: mapVisibility(contentItem.visibility),
        publishedAt: contentItem.publishedAt?.toISOString() ?? null,
        versions: contentItem.versions?.map(toContentVersionView),
        body: latestBody && typeof latestBody === 'object' ? latestBody : null,
        metadata: contentItem.metadata && typeof contentItem.metadata === 'object'
            ? contentItem.metadata
            : null,
    };
}
//# sourceMappingURL=mappers.js.map