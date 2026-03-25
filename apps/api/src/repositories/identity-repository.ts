
import { getCurrentUser } from '../data/platform-store';
import { toAuthenticatedUserView } from './mappers';
import { getPrismaClient, withRepositoryFallback } from './prisma';

export async function getCurrentUserProfile(userId: string) {
  return withRepositoryFallback(
    async () => {
      const prisma = getPrismaClient();
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
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

      return toAuthenticatedUserView(user);
    },
    () => getCurrentUser()
  );
}
export async function assignRole(input: {
  userId: string;
  roleKey: string;
  branchId?: string;
  ministryId?: string;
}) {
  return withRepositoryFallback(
    async () => {
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
    },
    async () => {
      // Minimal fallback for seeds if needed, or just throw if not implemented in seed store
      throw new Error('assignRole not implemented in mock seed store');
    }
  );
}
