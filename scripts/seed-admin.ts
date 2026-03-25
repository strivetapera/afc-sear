import { PrismaClient } from "@afc-sear/db";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@apostolicfaith.example";
  const adminPassword = "changeme-admin";

  console.log(`Cleaning up and re-seeding admin user: ${adminEmail}...`);

  // Cleanup to ensure fresh state and avoid UUID/duplicate issues
  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingUser) {
    await prisma.session.deleteMany({ where: { userId: existingUser.id } });
    await (prisma as any).account.deleteMany({ where: { userId: existingUser.id } });
    await (prisma as any).userRole.deleteMany({ where: { userId: existingUser.id } });
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // 1. Create User
  const userId = randomUUID();
  const user = await (prisma.user as any).create({
    data: {
      id: userId,
      email: adminEmail,
      name: "Platform Admin",
      emailVerified: true,
      isActive: true,
    },
  });

  // 2. Create Account (for Better Auth email/password)
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await (prisma as any).account.create({
    data: {
      id: randomUUID(),
      userId: userId,
      providerId: "credential",
      accountId: adminEmail,
      password: hashedPassword,
    },
  });

  console.log("Admin user and credential account created.");

  // 3. Ensure the user has the 'admin' role
  const adminRole = await prisma.role.upsert({
    where: { key: "admin" },
    update: {},
    create: {
      id: randomUUID(),
      name: "Administrator",
      key: "admin",
      description: "Full platform access",
    },
  });

  await (prisma as any).userRole.create({
    data: {
      id: randomUUID(),
      userId: userId,
      roleId: adminRole.id,
    }
  });

  console.log("Admin role assigned.");
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
