import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { type Auth } from '@afc-sear/auth';
import { getPrismaClient } from '../repositories/prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (role: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

interface AuthPluginOptions {
  auth: Auth;
}

const authPlugin: FastifyPluginAsync<AuthPluginOptions> = async (fastify, options) => {
  const { auth } = options;

  fastify.decorateRequest('user', undefined);

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    // Better Auth can check the session from the request headers/cookies
    const session = await auth.api.getSession({
        headers: request.headers as Record<string, string>,
    });

    if (!session) {
      reply.code(401).send({ error: 'unauthorized', message: 'Missing or invalid session' });
      return;
    }

    // Get the user's roles from the database
    const prisma = getPrismaClient();
    const userWithRoles = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        userRoles: {
          include: { role: { select: { key: true } } }
        }
      }
    });

    if (!userWithRoles) {
      reply.code(401).send({ error: 'unauthorized', message: 'User not found' });
      return;
    }

    request.user = {
      id: userWithRoles.id,
      email: userWithRoles.email,
      roles: userWithRoles.userRoles.map(ur => ur.role.key),
    };
  });

  fastify.decorate('requireRole', (role: string) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        reply.code(401).send({ error: 'unauthorized', message: 'Not authenticated' });
        return;
      }
      if (!request.user.roles.includes(role) && !request.user.roles.includes('super_admin')) {
        reply.code(403).send({ error: 'forbidden', message: `Requires role: ${role}` });
        return;
      }
    };
  });
};

export default fp(authPlugin);
