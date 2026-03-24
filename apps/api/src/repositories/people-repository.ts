import {
  getHouseholdForCurrentUser as getSeedHouseholdForCurrentUser,
  listPeople as listSeedPeople,
  upsertPerson as upsertSeedPerson,
} from '../data/platform-store';
import type { UpsertPersonRequest } from '../modules';
import { toPersonView } from './mappers';
import { getPrismaClient, withRepositoryFallback } from './prisma';

export async function listPeopleRecords(page = 1, pageSize = 50) {
  return withRepositoryFallback(
    async () => {
      const prisma = getPrismaClient();
      const people = await prisma.person.findMany({
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      return people.map(toPersonView);
    },
    () => listSeedPeople()
  );
}

export async function upsertPersonRecord(input: UpsertPersonRequest) {
  return withRepositoryFallback(
    async () => {
      const prisma = getPrismaClient();
      const person = await prisma.person.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          preferredName: input.preferredName ?? null,
          email: input.email ?? null,
          phone: input.phone ?? null,
          branchId: input.branchId ?? null,
          lifecycleStage: input.lifecycleStage ?? 'VISITOR',
        },
      });
      return toPersonView(person);
    },
    () =>
      upsertSeedPerson({
        firstName: input.firstName,
        lastName: input.lastName,
        preferredName: input.preferredName ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        branchId: input.branchId ?? null,
        lifecycleStage: input.lifecycleStage ?? 'VISITOR',
      })
  );
}

export async function getCurrentHousehold() {
  return withRepositoryFallback(
    async () => {
      const prisma = getPrismaClient();
      const household = await prisma.household.findFirst({
        orderBy: { createdAt: 'asc' },
        include: {
          members: {
            include: { person: true },
          },
        },
      });

      if (!household) return getSeedHouseholdForCurrentUser();

      return {
        id: household.id,
        branchId: household.branchId,
        displayName: household.displayName,
        primaryContactPersonId: household.primaryContactPersonId ?? null,
        members: household.members.map((member) => ({
          personId: member.personId,
          fullName: `${member.person.firstName} ${member.person.lastName}`.trim(),
          relationshipType: member.relationshipType,
          isPrimaryContact: member.isPrimaryContact,
        })),
      };
    },
    () => getSeedHouseholdForCurrentUser()
  );
}

// ─── Member self-service ───────────────────────────────────────────────────

export async function updateMemberProfile(userId: string, input: Partial<{
  firstName: string;
  lastName: string;
  preferredName: string;
  phone: string;
}>) {
  const prisma = getPrismaClient();
  // Link via user → person (users.personId if available, else just return user)
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  if (!user) throw new Error('User not found');

  // Find person linked by email
  if (Object.keys(input).length > 0) {
    await prisma.person.updateMany({
      where: { email: user.email },
      data: {
        ...(input.firstName !== undefined && { firstName: input.firstName }),
        ...(input.lastName !== undefined && { lastName: input.lastName }),
        ...(input.preferredName !== undefined && { preferredName: input.preferredName }),
        ...(input.phone !== undefined && { phone: input.phone }),
      },
    });
  }

  return { updated: true };
}

export async function getMemberRegistrations(userId: string) {
  const prisma = getPrismaClient();
  // Find person by user email, then get registrations
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user?.email) return [];

  const person = await prisma.person.findFirst({ where: { email: user.email } });
  if (!person) return [];

  return prisma.registration.findMany({
    where: { personId: person.id },
    orderBy: { createdAt: 'desc' },
    include: {
      event: { select: { id: true, title: true, slug: true } },
      attendees: { select: { id: true, fullName: true, checkInStatus: true } },
    },
  });
}

export async function getMemberGiving(userId: string) {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user?.email) return [];

  const person = await prisma.person.findFirst({ where: { email: user.email } });
  if (!person) return [];

  return prisma.donation.findMany({
    where: { personId: person.id },
    orderBy: { donatedAt: 'desc' },
    include: {
      fund: { select: { name: true, code: true } },
      payment: { select: { amountMinor: true, currencyCode: true, status: true } },
    },
  });
}

export async function getMemberAnnouncements(_userId: string) {
  const prisma = getPrismaClient();
  return prisma.announcement.findMany({
    where: { visibility: 'PUBLIC', publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    select: { id: true, title: true, body: true, publishedAt: true, branchId: true },
  });
}

export async function createPrayerRequest(userId: string, input: {
  requestText: string;
  visibility?: string;
  branchId?: string;
}) {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  const person = user?.email
    ? await prisma.person.findFirst({ where: { email: user.email } })
    : null;

  return prisma.prayerRequest.create({
    data: {
      personId: person?.id ?? null,
      branchId: input.branchId ?? null,
      requestText: input.requestText,
      visibility: (input.visibility as any) ?? 'PRIVATE',
    },
  });
}
