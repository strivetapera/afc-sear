  
import { getCurrentUser } from '../data/platform-store';
import { toAuthenticatedUserView } from './mappers';
import { getPrismaClient, withRepositoryFallback } from './prisma';

export async function listAdminUsers(page = 1, pageSize = 50) {
  const prisma = getPrismaClient();
  
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      person: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          preferredName: true,
          lifecycleStage: true,
          branchId: true,
        },
      },
      userRoles: {
        include: {
          role: {
            select: { key: true, name: true },
          },
        },
      },
      defaultBranch: {
        select: { id: true, name: true },
      },
    },
  });

  return {
    data: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      defaultBranchId: user.defaultBranchId,
      personId: user.personId,
      person: user.person,
      roles: user.userRoles.map((ur) => ({
        key: ur.role.key,
        name: ur.role.name,
        branchId: ur.branchId,
        ministryId: ur.ministryId,
      })),
      branch: user.defaultBranch,
    })),
    count: users.length,
  };
}

export async function getAdminUserById(userId: string) {
  const prisma = getPrismaClient();
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      person: true,
      userRoles: {
        include: {
          role: true,
        },
      },
      defaultBranch: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    defaultBranchId: user.defaultBranchId,
    personId: user.personId,
    person: user.person,
    roles: user.userRoles.map((ur) => ({
      key: ur.role.key,
      name: ur.role.name,
      branchId: ur.branchId,
      ministryId: ur.ministryId,
    })),
    branch: user.defaultBranch,
  };
}

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
