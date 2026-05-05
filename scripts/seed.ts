import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("12345678", 10);

  await prisma.user.upsert({
    where: { email: "admin@eventkonnect.com" },
    update: {},
    create: {
      email: "admin@eventkonnect.com",
      password,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "planner@eventkonnect.com" },
    update: {},
    create: {
      email: "planner@eventkonnect.com",
      password,
      firstName: "Event",
      lastName: "Planner",
      role: "event_planner",
    },
  });

  const vendorUser = await prisma.user.upsert({
    where: { email: "vendor@eventkonnect.com" },
    update: {},
    create: {
      email: "vendor@eventkonnect.com",
      password,
      firstName: "Vendor",
      lastName: "User",
      role: "vendor",
    },
  });

  await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      businessName: "Test Vendor Business",
      bio: "Test vendor bio",
      location: "Kigali, Rwanda",
    },
  });

  console.log("✅ Seed completed:");
  console.log("  Admin     → admin@eventkonnect.com / 12345678");
  console.log("  Planner   → planner@eventkonnect.com / 12345678");
  console.log("  Vendor    → vendor@eventkonnect.com / 12345678");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
