import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { PrismaClient } from "@afc-sear/db";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

export const auth = (prisma: PrismaClient) => betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
    basePath: "/api/v1/auth",
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    secret: process.env.BETTER_AUTH_SECRET || "development-secret-key-at-least-32-chars-long",
    emailAndPassword: {
        enabled: true,
        password: {
            hash: async (password: string) => bcrypt.hash(password, 10),
            verify: async ({ password, hash }: { password: string, hash: string }) => bcrypt.compare(password, hash),
        }
    },
    // ID generation for compatibility with UUID fields in Postgres
    advanced: {
        cookiePrefix: "afc-sear",
        generateId: () => randomUUID(),
    },
    trustedOrigins: [
        process.env.ADMIN_URL || "http://localhost:3001",
        process.env.WEB_URL || "http://localhost:3000",
        process.env.PORTAL_URL || "http://localhost:3002",
    ],
});

export type Auth = ReturnType<typeof auth>;
