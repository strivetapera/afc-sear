import { PrismaClient, ContentStatus, MinistryVisibility, UserStatus, VisibilityScope } from '@prisma/client';
import { randomBytes, createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import { corePageImports } from '../../../data/corePageImports.js';
import { events } from '../../../data/eventsData.js';
import {
  featuredStream,
  webcastNotes,
  webcastPage,
  webcastPlatforms,
  webcastSteps,
  webcastSupport,
} from '../../../data/liveWebcastData.js';
import { legacyZimbabweBranches } from '../../../data/legacyZimbabweSiteData.js';
import { newsItems } from '../../../data/newsData.js';
import { structuredPages } from '../../../data/structuredPagesData.js';
import discoveryLessons from '../../../data/lessons-discovery.json';

const prisma = new PrismaClient();

const permissions = [
  { key: 'identity.assign_role', name: 'Assign role', domain: 'identity' },
  { key: 'organization.manage_branch', name: 'Manage branch', domain: 'organization' },
  { key: 'people.manage_person', name: 'Manage person', domain: 'people' },
  { key: 'content.manage_item', name: 'Manage content item', domain: 'content' },
  { key: 'content.publish_item', name: 'Publish content item', domain: 'content' },
];

const roles = [
  { key: 'super_admin', name: 'Super Admin', permissionKeys: permissions.map((item) => item.key) },
  { key: 'branch_admin', name: 'Branch Admin', permissionKeys: ['organization.manage_branch', 'people.manage_person', 'content.manage_item'] },
  { key: 'editor', name: 'Editor', permissionKeys: ['content.manage_item', 'content.publish_item'] },
];

async function main() {
  const region = await prisma.region.upsert({
    where: { code: 'SEAR' },
    update: { name: 'Southern and Eastern Africa Region' },
    create: { code: 'SEAR', name: 'Southern and Eastern Africa Region' },
  });

  const country = await prisma.country.upsert({
    where: { code: 'ZW' },
    update: {
      name: 'Zimbabwe',
      currencyCode: 'USD',
      timezone: 'Africa/Harare',
      regionId: region.id,
    },
    create: {
      code: 'ZW',
      name: 'Zimbabwe',
      currencyCode: 'USD',
      timezone: 'Africa/Harare',
      regionId: region.id,
    },
  });

  for (const legacyBranch of legacyZimbabweBranches) {
    const slug =
      legacyBranch.id === 0
        ? 'harare'
        : `zw-${slugify(legacyBranch.name)}-${legacyBranch.id}`;

    await prisma.branch.upsert({
      where: { slug },
      update: {
        countryId: country.id,
        name: legacyBranch.name,
        type: 'local-church',
        email:
          legacyBranch.id === 0 ? 'harare@apostolicfaith.example' : null,
        phone: null,
        addressLine1:
          legacyBranch.address === 'TBC' ? null : legacyBranch.address,
        city: legacyBranch.name,
        isPublic: true,
        metadata: {
          legacyId: legacyBranch.id,
          congregation: `${legacyBranch.name} Assembly`,
          address:
            legacyBranch.address === 'TBC'
              ? 'Address details are being updated.'
              : legacyBranch.address,
          pastor: legacyBranch.pastor,
          serviceTimes: [
            'Sunday School - 9:00 AM',
            'Sunday Devotional Service - 10:30 AM',
            'Tuesday Evangelical Service - 6:00 PM',
            'Friday Bible Teaching - 6:00 PM',
          ],
          contact: 'Use the Contact page for an introduction to this branch.',
          notes:
            legacyBranch.address === 'TBC'
              ? 'This branch came from the legacy Zimbabwe directory and is waiting for a refreshed street address.'
              : 'This branch entry was preserved from the legacy Zimbabwe church directory.',
          livestream: legacyBranch.name === 'Harare',
        },
      },
      create: {
        countryId: country.id,
        name: legacyBranch.name,
        slug,
        type: 'local-church',
        email:
          legacyBranch.id === 0 ? 'harare@apostolicfaith.example' : null,
        phone: null,
        addressLine1:
          legacyBranch.address === 'TBC' ? null : legacyBranch.address,
        city: legacyBranch.name,
        isPublic: true,
        metadata: {
          legacyId: legacyBranch.id,
          congregation: `${legacyBranch.name} Assembly`,
          address:
            legacyBranch.address === 'TBC'
              ? 'Address details are being updated.'
              : legacyBranch.address,
          pastor: legacyBranch.pastor,
          serviceTimes: [
            'Sunday School - 9:00 AM',
            'Sunday Devotional Service - 10:30 AM',
            'Tuesday Evangelical Service - 6:00 PM',
            'Friday Bible Teaching - 6:00 PM',
          ],
          contact: 'Use the Contact page for an introduction to this branch.',
          notes:
            legacyBranch.address === 'TBC'
              ? 'This branch came from the legacy Zimbabwe directory and is waiting for a refreshed street address.'
              : 'This branch entry was preserved from the legacy Zimbabwe church directory.',
          livestream: legacyBranch.name === 'Harare',
        },
      },
    });
  }

  const branch = await prisma.branch.findUniqueOrThrow({
    where: { slug: 'harare' },
  });

  await prisma.ministry.upsert({
    where: {
      branchId_slug: {
        branchId: branch.id,
        slug: 'youth',
      },
    },
    update: {
      name: 'Youth Ministry',
      visibility: MinistryVisibility.MEMBER,
    },
    create: {
      branchId: branch.id,
      name: 'Youth Ministry',
      slug: 'youth',
      visibility: MinistryVisibility.MEMBER,
    },
  });

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: permission,
      create: permission,
    });
  }

  for (const role of roles) {
    const savedRole = await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name },
      create: { key: role.key, name: role.name },
    });

    for (const permissionKey of role.permissionKeys) {
      const permission = await prisma.permission.findUniqueOrThrow({
        where: { key: permissionKey },
      });

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: savedRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: savedRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  const publicPageType = await prisma.contentType.upsert({
    where: { key: 'page' },
    update: { name: 'Page' },
    create: { key: 'page', name: 'Page' },
  });

  const newsType = await prisma.contentType.upsert({
    where: { key: 'news' },
    update: { name: 'News' },
    create: { key: 'news', name: 'News' },
  });

  const eventType = await prisma.contentType.upsert({
    where: { key: 'event' },
    update: { name: 'Event' },
    create: { key: 'event', name: 'Event' },
  });

  const lessonType = await prisma.contentType.upsert({
    where: { key: 'lesson' },
    update: { name: 'Sunday School Lesson' },
    create: { key: 'lesson', name: 'Sunday School Lesson' },
  });

  const existingAdminPerson = await prisma.person.findFirst({
    where: { email: 'admin@apostolicfaith.example' },
  });

  const adminPerson = existingAdminPerson
    ? await prisma.person.update({
        where: { id: existingAdminPerson.id },
        data: {
          firstName: 'Platform',
          lastName: 'Administrator',
          preferredName: 'Admin',
          phone: '+263771400856',
          branchId: branch.id,
          lifecycleStage: 'STAFF',
        },
      })
    : await prisma.person.create({
        data: {
          firstName: 'Platform',
          lastName: 'Administrator',
          preferredName: 'Admin',
          email: 'admin@apostolicfaith.example',
          phone: '+263771400856',
          branchId: branch.id,
          lifecycleStage: 'STAFF',
        },
      });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@apostolicfaith.example' },
    update: {
      status: UserStatus.ACTIVE,
      isActive: true,
      defaultBranchId: branch.id,
      personId: adminPerson.id,
      name: 'Platform Admin',
    },
    create: {
      email: 'admin@apostolicfaith.example',
      status: UserStatus.ACTIVE,
      isActive: true,
      defaultBranchId: branch.id,
      personId: adminPerson.id,
      name: 'Platform Admin',
    },
  });

  const adminPasswordHash = await hashPassword('changeme-admin');

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: 'credential',
        accountId: `credential-${adminUser.id}`,
      },
    },
    update: {
      password: adminPasswordHash,
      userId: adminUser.id,
    },
    create: {
      id: `acc-${randomBytes(16).toString('hex')}`,
      accountId: `credential-${adminUser.id}`,
      providerId: 'credential',
      userId: adminUser.id,
      password: adminPasswordHash,
    },
  });

  await prisma.communicationPreference.upsert({
    where: { personId: adminPerson.id },
    update: {
      emailOptIn: true,
      whatsappOptIn: true,
      smsOptIn: true,
    },
    create: {
      personId: adminPerson.id,
      emailOptIn: true,
      whatsappOptIn: true,
      smsOptIn: true,
    },
  });

  const adminHousehold = await prisma.household.upsert({
    where: {
      branchId_displayName: {
        branchId: branch.id,
        displayName: 'Administrator Household',
      },
    },
    update: {
      primaryContactPersonId: adminPerson.id,
      addressLine1: 'Platform Seed Address',
      city: 'Harare',
    },
    create: {
      branchId: branch.id,
      displayName: 'Administrator Household',
      primaryContactPersonId: adminPerson.id,
      addressLine1: 'Platform Seed Address',
      city: 'Harare',
    },
  });

  await prisma.householdMember.upsert({
    where: {
      householdId_personId: {
        householdId: adminHousehold.id,
        personId: adminPerson.id,
      },
    },
    update: {
      relationshipType: 'SELF',
      isPrimaryContact: true,
    },
    create: {
      householdId: adminHousehold.id,
      personId: adminPerson.id,
      relationshipType: 'SELF',
      isPrimaryContact: true,
    },
  });

  await prisma.memberProfile.upsert({
    where: { personId: adminPerson.id },
    update: {
      membershipStatus: 'ACTIVE',
      joinedBranchId: branch.id,
    },
    create: {
      personId: adminPerson.id,
      membershipStatus: 'ACTIVE',
      joinedBranchId: branch.id,
    },
  });

  const adminUser2 = await prisma.user.upsert({
    where: { email: 'admin@afc-sear.org' },
    update: {
      status: UserStatus.ACTIVE,
      isActive: true,
      defaultBranchId: branch.id,
      name: 'Admin User',
    },
    create: {
      email: 'admin@afc-sear.org',
      status: UserStatus.ACTIVE,
      isActive: true,
      defaultBranchId: branch.id,
      name: 'Admin User',
    },
  });

  const admin2PasswordHash = await hashPassword('changeme-admin');

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: 'credential',
        accountId: `credential-${adminUser2.id}`,
      },
    },
    update: {
      password: admin2PasswordHash,
      userId: adminUser2.id,
    },
    create: {
      id: `acc-${randomBytes(16).toString('hex')}`,
      accountId: `credential-${adminUser2.id}`,
      providerId: 'credential',
      userId: adminUser2.id,
      password: admin2PasswordHash,
    },
  });

  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { key: 'super_admin' },
  });

  const existingUserRole = await prisma.userRole.findFirst({
    where: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
      branchId: branch.id,
      ministryId: null,
    },
  });

  if (!existingUserRole) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
        branchId: branch.id,
      },
    });
  }

  const existingUserRole2 = await prisma.userRole.findFirst({
    where: {
      userId: adminUser2.id,
      roleId: superAdminRole.id,
      branchId: branch.id,
      ministryId: null,
    },
  });

  if (!existingUserRole2) {
    await prisma.userRole.create({
      data: {
        userId: adminUser2.id,
        roleId: superAdminRole.id,
        branchId: branch.id,
      },
    });
  }

  for (const page of corePageImports) {
    await upsertStructuredPageContent({
      prisma,
      branchId: branch.id,
      authorUserId: adminUser.id,
      contentTypeId: publicPageType.id,
      slug: page.slug,
      title: page.title,
      summary: page.summary,
      body: page.body,
    });
  }

  const liveWebcastPage = await prisma.contentItem.upsert({
    where: { slug: 'live-webcast' },
    update: {
      contentTypeId: publicPageType.id,
      branchId: branch.id,
      authorUserId: adminUser.id,
      title: webcastPage.title,
      summary: webcastPage.lead,
      status: ContentStatus.PUBLISHED,
      visibility: VisibilityScope.PUBLIC,
      publishedAt: new Date(),
    },
    create: {
      contentTypeId: publicPageType.id,
      branchId: branch.id,
      authorUserId: adminUser.id,
      title: webcastPage.title,
      slug: 'live-webcast',
      summary: webcastPage.lead,
      status: ContentStatus.PUBLISHED,
      visibility: VisibilityScope.PUBLIC,
      publishedAt: new Date(),
    },
  });

  await prisma.contentVersion.upsert({
    where: {
      contentItemId_versionNumber: {
        contentItemId: liveWebcastPage.id,
        versionNumber: 1,
      },
    },
    update: {
      body: {
        ...webcastPage,
        featured: featuredStream,
        notes: webcastNotes,
        platforms: webcastPlatforms,
        steps: webcastSteps,
        support: webcastSupport,
      },
    },
    create: {
      contentItemId: liveWebcastPage.id,
      versionNumber: 1,
      createdById: adminUser.id,
      body: {
        ...webcastPage,
        featured: featuredStream,
        notes: webcastNotes,
        platforms: webcastPlatforms,
        steps: webcastSteps,
        support: webcastSupport,
      },
    },
  });

  for (const newsItem of newsItems) {
    await prisma.contentItem.upsert({
      where: { slug: newsItem.id },
      update: {
        contentTypeId: newsType.id,
        authorUserId: adminUser.id,
        branchId: branch.id,
        title: newsItem.title,
        summary: newsItem.summary,
        status: ContentStatus.PUBLISHED,
        visibility: VisibilityScope.PUBLIC,
        publishedAt: new Date(newsItem.publishedAt),
        metadata: {
          category: newsItem.category,
          location: newsItem.location,
          status: newsItem.status,
        },
      },
      create: {
        contentTypeId: newsType.id,
        authorUserId: adminUser.id,
        branchId: branch.id,
        title: newsItem.title,
        slug: newsItem.id,
        summary: newsItem.summary,
        status: ContentStatus.PUBLISHED,
        visibility: VisibilityScope.PUBLIC,
        publishedAt: new Date(newsItem.publishedAt),
        metadata: {
          category: newsItem.category,
          location: newsItem.location,
          status: newsItem.status,
        },
      },
    });
  }

  for (const event of events) {
    const startDateTime = 'startDateTime' in event ? event.startDateTime ?? null : null;
    const link = 'link' in event ? event.link ?? null : null;

    await prisma.contentItem.upsert({
      where: { slug: event.id },
      update: {
        contentTypeId: eventType.id,
        authorUserId: adminUser.id,
        branchId: branch.id,
        title: event.title,
        summary: event.description ?? null,
        status: ContentStatus.PUBLISHED,
        visibility: VisibilityScope.PUBLIC,
        publishedAt: new Date(),
        metadata: {
          recurrence: event.recurrence ?? null,
          startDateTime,
          link,
        },
      },
      create: {
        contentTypeId: eventType.id,
        authorUserId: adminUser.id,
        branchId: branch.id,
        title: event.title,
        slug: event.id,
        summary: event.description ?? null,
        status: ContentStatus.PUBLISHED,
        visibility: VisibilityScope.PUBLIC,
        publishedAt: new Date(),
        metadata: {
          recurrence: event.recurrence ?? null,
          startDateTime,
          link,
        },
      },
    });
  }

  for (const lesson of discoveryLessons) {
    const lessonSlug = `lesson-${slugify(lesson.topic)}`;
    const lessonItem = await prisma.contentItem.upsert({
      where: { slug: lessonSlug },
      update: {
        contentTypeId: lessonType.id,
        authorUserId: adminUser.id,
        branchId: branch.id,
        title: lesson.topic,
        summary: lesson.sourceReference,
        status: ContentStatus.PUBLISHED,
        visibility: VisibilityScope.PUBLIC,
        publishedAt: new Date(lesson.effectiveDate),
        metadata: {
          keyVerse: lesson.keyVerse,
          sourceLink: lesson.sourceLink,
        },
      },
      create: {
        contentTypeId: lessonType.id,
        authorUserId: adminUser.id,
        branchId: branch.id,
        title: lesson.topic,
        slug: lessonSlug,
        summary: lesson.sourceReference,
        status: ContentStatus.PUBLISHED,
        visibility: VisibilityScope.PUBLIC,
        publishedAt: new Date(lesson.effectiveDate),
        metadata: {
          keyVerse: lesson.keyVerse,
          sourceLink: lesson.sourceLink,
        },
      },
    });

    await prisma.contentVersion.upsert({
      where: {
        contentItemId_versionNumber: {
          contentItemId: lessonItem.id,
          versionNumber: 1,
        },
      },
      update: {
        body: {
          background: lesson.background,
          questions: lesson.questions,
          conclusion: lesson.conclusion,
        },
      },
      create: {
        contentItemId: lessonItem.id,
        versionNumber: 1,
        createdById: adminUser.id,
        body: {
          background: lesson.background,
          questions: lesson.questions,
          conclusion: lesson.conclusion,
        },
      },
    });
  }

  // --- Event registration seed ---
  const venueId = '639da253-6a68-4a5f-871d-5878477b73cc';
  const scheduleId = '7d2e3f5a-4b9c-4d8e-a1b2-c3d4e5f6a7b8';
  const ticket1Id = '8e1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c';
  const ticket2Id = '9f2a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c';
  const inventoryDormId = 'a1f0b5c1-0f77-4209-a4c6-4bd2e1a92701';
  const inventoryCottageId = 'b27b8ea6-66f0-4dfa-85bc-91a6b4615302';

  const venue = await prisma.venue.upsert({
    where: { id: venueId },
    update: {
      name: 'Harare Central Tabernacle',
      addressLine1: '123 Samora Machel Ave',
      city: 'Harare',
      capacity: 500,
      branchId: branch.id,
    },
    create: {
      id: venueId,
      name: 'Harare Central Tabernacle',
      addressLine1: '123 Samora Machel Ave',
      city: 'Harare',
      capacity: 500,
      branchId: branch.id,
    },
  });

  const conference = await prisma.event.upsert({
    where: { slug: 'youth-conference-2026' },
    update: {
      title: 'Annual Youth Conference 2026',
      summary: 'Join young people from across the region for three days of worship, teaching, and fellowship.',
      description: {
        content: 'Our annual youth conference is back! This year\'s theme is "Rise and Shine". We have prepared inspiring sessions, practical workshops, and engaging activities to help you grow in your faith and connect with fellow believers.'
      },
      eventType: 'CONFERENCE',
      visibility: VisibilityScope.PUBLIC,
      status: ContentStatus.PUBLISHED,
      registrationMode: 'OPEN',
      venueId: venue.id,
      branchId: branch.id,
    },
    create: {
      title: 'Annual Youth Conference 2026',
      slug: 'youth-conference-2026',
      summary: 'Join young people from across the region for three days of worship, teaching, and fellowship.',
      description: {
        content: 'Our annual youth conference is back! This year\'s theme is "Rise and Shine". We have prepared inspiring sessions, practical workshops, and engaging activities to help you grow in your faith and connect with fellow believers.'
      },
      eventType: 'CONFERENCE',
      visibility: VisibilityScope.PUBLIC,
      status: ContentStatus.PUBLISHED,
      registrationMode: 'OPEN',
      venueId: venue.id,
      branchId: branch.id,
    },
  });

  await prisma.eventSchedule.upsert({
    where: { id: scheduleId },
    update: {
      startsAt: new Date('2026-08-15T09:00:00Z'),
      endsAt: new Date('2026-08-17T17:00:00Z'),
      timezone: 'CAT',
      eventId: conference.id,
    },
    create: {
      id: scheduleId,
      startsAt: new Date('2026-08-15T09:00:00Z'),
      endsAt: new Date('2026-08-17T17:00:00Z'),
      timezone: 'CAT',
      eventId: conference.id,
    },
  });

  await prisma.ticketType.upsert({
    where: { id: ticket1Id },
    update: {
      name: 'General Admission',
      priceMinor: 0,
      currencyCode: 'USD',
      eventId: conference.id,
    },
    create: {
      id: ticket1Id,
      name: 'General Admission',
      priceMinor: 0,
      currencyCode: 'USD',
      eventId: conference.id,
    },
  });

  await prisma.ticketType.upsert({
    where: { id: ticket2Id },
    update: {
      name: 'Premium (Includes Meals)',
      priceMinor: 2500,
      currencyCode: 'USD',
      eventId: conference.id,
    },
    create: {
      id: ticket2Id,
      name: 'Premium (Includes Meals)',
      priceMinor: 2500,
      currencyCode: 'USD',
      eventId: conference.id,
    },
  });

  await prisma.registrationForm.upsert({
    where: { eventId: conference.id },
    update: {
      status: 'ACTIVE',
      schema: {
        fields: [
          { key: 'fullName', label: 'Full Name', type: 'text', required: true },
          { key: 'email', label: 'Email Address', type: 'email', required: true },
          { key: 'phone', label: 'Phone Number', type: 'tel', required: true },
          { key: 'branchName', label: 'Branch', type: 'text', required: false },
          { key: 'ageGroup', label: 'Age Group', type: 'text', required: false },
        ],
      },
    },
    create: {
      eventId: conference.id,
      status: 'ACTIVE',
      schema: {
        fields: [
          { key: 'fullName', label: 'Full Name', type: 'text', required: true },
          { key: 'email', label: 'Email Address', type: 'email', required: true },
          { key: 'phone', label: 'Phone Number', type: 'tel', required: true },
          { key: 'branchName', label: 'Branch', type: 'text', required: false },
          { key: 'ageGroup', label: 'Age Group', type: 'text', required: false },
        ],
      },
    },
  });

  await prisma.eventRegistrationPolicy.upsert({
    where: { eventId: conference.id },
    update: {
      codePrefix: 'YTHCONF',
      paymentDeadline: new Date('2026-08-10T23:59:59Z'),
      cancellationDeadline: new Date('2026-08-12T23:59:59Z'),
      requireFullPaymentForCheckIn: true,
      allowWaitlist: true,
      allowSelfServiceLookup: true,
      supportedChannels: ['WEB', 'WHATSAPP', 'ADMIN'],
      pricingRules: [
        { inventoryCategory: 'Dormitory', amountMinor: 3000 },
        { inventoryCategory: 'Cottage', amountMinor: 5000 },
      ],
      confirmationConfig: {
        successHeading: 'Registration Received!',
        successMessage: 'Your place has been reserved. Keep your registration code for future updates and check-in.',
      },
    },
    create: {
      eventId: conference.id,
      codePrefix: 'YTHCONF',
      paymentDeadline: new Date('2026-08-10T23:59:59Z'),
      cancellationDeadline: new Date('2026-08-12T23:59:59Z'),
      requireFullPaymentForCheckIn: true,
      allowWaitlist: true,
      allowSelfServiceLookup: true,
      supportedChannels: ['WEB', 'WHATSAPP', 'ADMIN'],
      pricingRules: [
        { inventoryCategory: 'Dormitory', amountMinor: 3000 },
        { inventoryCategory: 'Cottage', amountMinor: 5000 },
      ],
      confirmationConfig: {
        successHeading: 'Registration Received!',
        successMessage: 'Your place has been reserved. Keep your registration code for future updates and check-in.',
      },
    },
  });

  await prisma.eventRegistrationInventory.upsert({
    where: { id: inventoryDormId },
    update: {
      eventId: conference.id,
      category: 'Dormitory',
      name: 'Youth Camp Dormitory',
      capacity: 80,
      isActive: true,
    },
    create: {
      id: inventoryDormId,
      eventId: conference.id,
      category: 'Dormitory',
      name: 'Youth Camp Dormitory',
      capacity: 80,
      isActive: true,
    },
  });

  await prisma.eventRegistrationInventory.upsert({
    where: { id: inventoryCottageId },
    update: {
      eventId: conference.id,
      category: 'Cottage',
      name: 'Southwind Cottage',
      capacity: 12,
      isActive: true,
    },
    create: {
      id: inventoryCottageId,
      eventId: conference.id,
      category: 'Cottage',
      name: 'Southwind Cottage',
      capacity: 12,
      isActive: true,
    },
  });
}


main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function upsertStructuredPageContent({
  prisma,
  branchId,
  authorUserId,
  contentTypeId,
  slug,
  title,
  summary,
  body,
}: {
  prisma: PrismaClient;
  branchId: string;
  authorUserId: string;
  contentTypeId: string;
  slug: string;
  title: string;
  summary: string;
  body: Record<string, unknown>;
}) {
  const page = await prisma.contentItem.upsert({
    where: { slug },
    update: {
      contentTypeId,
      branchId,
      authorUserId,
      title,
      summary,
      status: ContentStatus.PUBLISHED,
      visibility: VisibilityScope.PUBLIC,
      publishedAt: new Date(),
    },
    create: {
      contentTypeId,
      branchId,
      authorUserId,
      title,
      slug,
      summary,
      status: ContentStatus.PUBLISHED,
      visibility: VisibilityScope.PUBLIC,
      publishedAt: new Date(),
    },
  });

  await prisma.contentVersion.upsert({
    where: {
      contentItemId_versionNumber: {
        contentItemId: page.id,
        versionNumber: 1,
      },
    },
    update: {
      body,
    },
    create: {
      contentItemId: page.id,
      versionNumber: 1,
      createdById: authorUserId,
      body,
    },
  });
}
