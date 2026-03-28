"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const prisma_1 = require("better-auth/adapters/prisma");
const node_crypto_1 = require("node:crypto");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth = (prisma) => (0, better_auth_1.betterAuth)({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
    basePath: "/api/v1/auth",
    database: (0, prisma_1.prismaAdapter)(prisma, {
        provider: "postgresql",
    }),
    secret: process.env.BETTER_AUTH_SECRET || "development-secret-key-at-least-32-chars-long",
    emailAndPassword: {
        enabled: true,
        password: {
            hash: async (password) => bcryptjs_1.default.hash(password, 10),
            verify: async ({ password, hash }) => bcryptjs_1.default.compare(password, hash),
        }
    },
    // ID generation for compatibility with UUID fields in Postgres
    advanced: {
        cookiePrefix: "afc-sear",
        generateId: () => (0, node_crypto_1.randomUUID)(),
    },
    trustedOrigins: [
        process.env.ADMIN_URL || "http://localhost:3001",
        process.env.WEB_URL || "http://localhost:3000",
        process.env.PORTAL_URL || "http://localhost:3002",
    ],
});
exports.auth = auth;
