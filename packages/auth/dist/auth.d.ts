import type { PrismaClient } from "@afc-sear/db";
export declare const auth: (prisma: PrismaClient) => import("better-auth", { with: { "resolution-mode": "import" } }).Auth<{
    baseURL: string;
    basePath: string;
    database: (options: import("better-auth", { with: { "resolution-mode": "import" } }).BetterAuthOptions) => import("better-auth", { with: { "resolution-mode": "import" } }).DBAdapter<import("better-auth", { with: { "resolution-mode": "import" } }).BetterAuthOptions>;
    secret: string;
    emailAndPassword: {
        enabled: true;
        password: {
            hash: (password: string) => Promise<string>;
            verify: ({ password, hash }: {
                password: string;
                hash: string;
            }) => Promise<boolean>;
        };
    };
    advanced: {
        cookiePrefix: string;
        generateId: () => `${string}-${string}-${string}-${string}-${string}`;
    };
    trustedOrigins: string[];
}>;
export type Auth = ReturnType<typeof auth>;
