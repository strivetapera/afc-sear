import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { verifyToken, type VerifiedUser } from '@afc-sear/auth';
import { getPrismaClient } from '../repositories/prisma';

declare module 'fastify' {
  interface FastifyRequest {
    user?: VerifiedUser;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (role: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

interface AuthPluginOptions {
  issuerUrl: string;
  clientId: string;
}

const authPlugin: FastifyPluginAsync<AuthPluginOptions> = async (fastify, options) => {
  fastify.decorateRequest('user', undefined);

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({ error: 'unauthorized', message: 'Missing or invalid Authorization header' });
      return;
    }

    const token = authHeader.substring(7);
    
    // Check if it's a UUID (local session)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
    
    let user: VerifiedUser | null = null;

    if (isUuid) {
      // Local development fallback: Verify session in database
      const prisma = getPrismaClient();
      const session = await prisma.session.findUnique({
        where: { id: token },
        include: {
          user: {
            include: {
              userRoles: {
                include: { role: { select: { key: true } } }
              }
            }
          }
        }
      });

      if (session && session.expiresAt > new Date()) {
        user = {
          id: session.user.id,
          email: session.user.email,
          roles: session.user.userRoles.map(ur => ur.role.key),
        } as VerifiedUser;
      }
    } else {
      // Standard JWT verify via Keycloak/Auth service
      user = await verifyToken(token, {
        issuerUrl: options.issuerUrl,
        clientId: options.clientId,
      }).catch(() => null);
    }

    if (!user) {
      reply.code(401).send({ error: 'unauthorized', message: 'Invalid or expired token' });
      return;
    }

    request.user = user;
  });

  fastify.decorate('requireRole', (role: string) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        reply.code(401).send({ error: 'unauthorized', message: 'Not authenticated' });
        return;
      }
      if (!request.user.roles.includes(role)) {
        reply.code(403).send({ error: 'forbidden', message: `Requires role: ${role}` });
        return;
      }
    };
  });
};

export default fp(authPlugin);
