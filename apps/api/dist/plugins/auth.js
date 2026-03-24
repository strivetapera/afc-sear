import fp from 'fastify-plugin';
import { verifyToken } from '@afc-sear/auth';
const authPlugin = async (fastify, options) => {
    fastify.decorateRequest('user', undefined);
    fastify.decorate('authenticate', async (request, reply) => {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            reply.code(401).send({ error: 'unauthorized', message: 'Missing or invalid Authorization header' });
            return;
        }
        const token = authHeader.substring(7);
        const user = await verifyToken(token, {
            issuerUrl: options.issuerUrl,
            clientId: options.clientId,
        });
        if (!user) {
            reply.code(401).send({ error: 'unauthorized', message: 'Invalid or expired token' });
            return;
        }
        request.user = user;
    });
    fastify.decorate('requireRole', (role) => {
        return async (request, reply) => {
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
//# sourceMappingURL=auth.js.map