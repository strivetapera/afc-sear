"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const prisma_1 = require("../repositories/prisma");
const authPlugin = async (fastify, options) => {
    const { auth } = options;
    fastify.decorateRequest('user', undefined);
    fastify.decorate('authenticate', async (request, reply) => {
        // Better Auth can check the session from the request headers/cookies
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        if (!session) {
            reply.code(401).send({ error: 'unauthorized', message: 'Missing or invalid session' });
            return;
        }
        // Get the user's roles from the database
        const prisma = (0, prisma_1.getPrismaClient)();
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
    fastify.decorate('requireRole', (role) => {
        return async (request, reply) => {
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
exports.default = (0, fastify_plugin_1.default)(authPlugin);
//# sourceMappingURL=auth.js.map