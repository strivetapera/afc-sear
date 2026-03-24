import { randomUUID } from 'node:crypto';
import { getCurrentUser, signIn as seedSignIn } from '../data/platform-store';
import { toAuthenticatedUserView } from './mappers';
import { getPrismaClient, withRepositoryFallback } from './prisma';
const SEEDED_ADMIN_PASSWORD = 'changeme-admin';
export async function signIn(request) {
    return withRepositoryFallback(async () => {
        const normalizedLogin = request.login.trim().toLowerCase();
        const passwordMatches = request.password === SEEDED_ADMIN_PASSWORD;
        if (!passwordMatches) {
            return null;
        }
        const prisma = getPrismaClient();
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: normalizedLogin },
                    { phone: request.login.trim() },
                ],
                isActive: true,
            },
            include: {
                userRoles: {
                    include: {
                        role: {
                            select: {
                                key: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            return null;
        }
        return {
            user: toAuthenticatedUserView(user),
            session: {
                id: randomUUID(),
                deviceLabel: 'Database-backed local session',
                ipAddress: '127.0.0.1',
                userAgent: 'manual-local-client',
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
            },
            requiresMfa: false,
        };
    }, () => seedSignIn(request));
}
export async function getCurrentUserProfile() {
    return withRepositoryFallback(async () => {
        const prisma = getPrismaClient();
        const user = await prisma.user.findFirstOrThrow({
            where: {
                isActive: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                userRoles: {
                    include: {
                        role: {
                            select: {
                                key: true,
                            },
                        },
                    },
                },
            },
        });
        return toAuthenticatedUserView(user);
    }, () => getCurrentUser());
}
export async function assignRole(input) {
    return withRepositoryFallback(async () => {
        const prisma = getPrismaClient();
        const role = await prisma.role.findUniqueOrThrow({
            where: { key: input.roleKey }
        });
        const userRole = await prisma.userRole.create({
            data: {
                userId: input.userId,
                roleId: role.id,
                branchId: input.branchId ?? null,
                ministryId: input.ministryId ?? null,
            },
            include: {
                user: {
                    include: {
                        userRoles: {
                            include: {
                                role: {
                                    select: {
                                        key: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return toAuthenticatedUserView(userRole.user);
    }, async () => {
        // Minimal fallback for seeds if needed, or just throw if not implemented in seed store
        throw new Error('assignRole not implemented in mock seed store');
    });
}
//# sourceMappingURL=identity-repository.js.map