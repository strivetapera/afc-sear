import {
  getLocationsDirectory as getSeedLocationsDirectory,
  listBranches as listSeedBranches,
} from '../data/platform-store';
import {
  fallbackLocationsContacts,
  fallbackLocationsMetadata,
  fallbackLocationsOverview,
} from '../data/locations-fallback';
import type { CreateBranchRequest, MinistryView } from '../modules';
import { toBranchView } from './mappers';
import { getPrismaClient, withRepositoryFallback } from './prisma';

export async function listPublicBranches() {
  return withRepositoryFallback(
    async () => {
      const prisma = getPrismaClient();
      const branches = await prisma.branch.findMany({
        where: {
          isPublic: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return branches.map(toBranchView);
    },
    () => listSeedBranches()
  );
}

export async function listAdminBranches() {
  return withRepositoryFallback(
    async () => {
      const prisma = getPrismaClient();
      const branches = await prisma.branch.findMany({
        orderBy: {
          name: 'asc',
        },
        include: {
          country: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              ministries: true,
            },
          },
        },
      });

      return branches.map((branch) => ({
        ...toBranchView(branch),
        countryName: branch.country.name,
        ministryCount: branch._count.ministries,
      }));
    },
    () => listSeedBranches()
  );
}

export async function createBranch(input: CreateBranchRequest) {
  return withRepositoryFallback(
    async () => {
      const prisma = getPrismaClient();
      const branch = await prisma.branch.create({
        data: {
          countryId: input.countryId,
          name: input.name,
          slug: input.slug,
          type: input.type,
          email: input.email ?? null,
          phone: input.phone ?? null,
          addressLine1: input.addressLine1 ?? null,
          city: input.city ?? null,
          isPublic: true,
        },
      });

      return toBranchView(branch);
    },
    async () => {
      throw new Error('createBranch not implemented in mock seed store');
    }
  );
}

export async function listMinistries(): Promise<{ data: MinistryView[]; source: string }> {
  return withRepositoryFallback(
    async () => {
      const prisma = getPrismaClient();
      const ministries = await prisma.ministry.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      return ministries.map((m) => ({
        id: m.id,
        branchId: m.branchId ?? null,
        name: m.name,
        slug: m.slug,
        visibility: m.visibility as MinistryView['visibility'],
      }));
    },
    async () => {
      return []; // Or fallback to seed ministries if added to platform-store
    }
  );
}


export async function getLocationsDirectory() {
  return withRepositoryFallback(
    async () => {
      const prisma = getPrismaClient();
      const branches = await prisma.branch.findMany({
        where: {
          isPublic: true,
        },
        orderBy: [{ country: { name: 'asc' } }, { name: 'asc' }],
        include: {
          country: {
            select: {
              name: true,
            },
          },
        },
      });

      const grouped = branches.reduce<Record<string, { country: string; locations: Array<{
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
      }> }>>((accumulator, branch) => {
          const metadata =
            branch.metadata && typeof branch.metadata === 'object'
              ? (branch.metadata as Record<string, unknown>)
              : {};
          const country = branch.country.name;

          if (!accumulator[country]) {
            accumulator[country] = {
              country,
              locations: [],
            };
          }

          accumulator[country].locations.push({
            id: branch.id,
            country,
            city: branch.name,
            congregation:
              stringOrFallback(metadata.congregation, `${branch.name} Assembly`),
            address:
              stringOrFallback(metadata.address, 'Address details are being updated.'),
            serviceTimes: arrayOfStringsOrFallback(metadata.serviceTimes, []),
            contact:
              stringOrFallback(
                metadata.contact,
                'Use the Contact page for an introduction to this branch.'
              ),
            pastor: stringOrFallback(metadata.pastor, 'Pastor details pending'),
            notes: stringOrFallback(metadata.notes, ''),
            livestream: booleanOrFallback(metadata.livestream, false),
          });

          return accumulator;
        }, {});

      const groupedLocations = Object.values(grouped)
        .map((group) => ({
          country: group.country,
          locations: [...group.locations].sort((a, b) => a.city.localeCompare(b.city)),
        }))
        .sort((a, b) => a.country.localeCompare(b.country));

      return {
        metadata: fallbackLocationsMetadata,
        overview: fallbackLocationsOverview,
        contacts: fallbackLocationsContacts,
        groupedLocations,
      };
    },
    () => getSeedLocationsDirectory()
  );
}

function stringOrFallback(value: unknown, fallback: string) {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function arrayOfStringsOrFallback(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  return value.filter((item): item is string => typeof item === 'string');
}

function booleanOrFallback(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}
