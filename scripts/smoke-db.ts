import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5433/woosh?schema=public",
  });
  const prisma = new PrismaClient({ adapter });
  const email = "smoke-brand@woosh.test";
  await prisma.user.deleteMany({ where: { email } });
  const passwordHash = await hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      email,
      name: "Smoke Brand",
      passwordHash,
      status: "ACTIVE",
      memberships: {
        create: {
          role: "OWNER",
          canApprovePayments: true,
          canEditRates: true,
          canManageTeam: true,
          canExportData: true,
          organisation: {
            create: {
              type: "BRAND",
              legalName: "Smoke Brand Ltd",
              publicName: "Smoke Brand",
              country: "NG",
              brands: { create: { name: "Smoke Brand", country: "NG" } },
            },
          },
        },
      },
    },
    include: {
      memberships: { include: { organisation: { include: { brands: true } } } },
    },
  });
  console.log(
    "OK",
    user.id,
    user.memberships[0].organisation.brands[0].name,
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
