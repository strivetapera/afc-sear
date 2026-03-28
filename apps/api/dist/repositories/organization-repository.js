"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicBranches = listPublicBranches;
exports.listAdminBranches = listAdminBranches;
exports.createBranch = createBranch;
exports.listMinistries = listMinistries;
exports.getLocationsDirectory = getLocationsDirectory;
const platform_store_1 = require("../data/platform-store");
const locations_fallback_1 = require("../data/locations-fallback");
const mappers_1 = require("./mappers");
const prisma_1 = require("./prisma");
async function listPublicBranches() {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
        const branches = await prisma.branch.findMany({
            where: {
                isPublic: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return branches.map(mappers_1.toBranchView);
    }, () => (0, platform_store_1.listBranches)());
}
async function listAdminBranches() {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
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
            ...(0, mappers_1.toBranchView)(branch),
            countryName: branch.country.name,
            ministryCount: branch._count.ministries,
        }));
    }, () => (0, platform_store_1.listBranches)());
}
async function createBranch(input) {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
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
        return (0, mappers_1.toBranchView)(branch);
    }, async () => {
        throw new Error('createBranch not implemented in mock seed store');
    });
}
async function listMinistries() {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
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
            visibility: m.visibility,
        }));
    }, async () => {
        return []; // Or fallback to seed ministries if added to platform-store
    });
}
async function getLocationsDirectory() {
    return (0, prisma_1.withRepositoryFallback)(async () => {
        const prisma = (0, prisma_1.getPrismaClient)();
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
        const grouped = branches.reduce((accumulator, branch) => {
            const metadata = branch.metadata && typeof branch.metadata === 'object'
                ? branch.metadata
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
                congregation: stringOrFallback(metadata.congregation, `${branch.name} Assembly`),
                address: stringOrFallback(metadata.address, 'Address details are being updated.'),
                serviceTimes: arrayOfStringsOrFallback(metadata.serviceTimes, []),
                contact: stringOrFallback(metadata.contact, 'Use the Contact page for an introduction to this branch.'),
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
            metadata: locations_fallback_1.fallbackLocationsMetadata,
            overview: locations_fallback_1.fallbackLocationsOverview,
            contacts: locations_fallback_1.fallbackLocationsContacts,
            groupedLocations,
        };
    }, () => (0, platform_store_1.getLocationsDirectory)());
}
function stringOrFallback(value, fallback) {
    return typeof value === 'string' && value.length > 0 ? value : fallback;
}
function arrayOfStringsOrFallback(value, fallback) {
    if (!Array.isArray(value))
        return fallback;
    return value.filter((item) => typeof item === 'string');
}
function booleanOrFallback(value, fallback) {
    return typeof value === 'boolean' ? value : fallback;
}
//# sourceMappingURL=organization-repository.js.map