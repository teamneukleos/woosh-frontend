import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hash } from "bcryptjs";
import { inviteTeammate, inviteToBrief } from "../src/domains/organisation/invites";
import { createBrief } from "../src/domains/marketplace/briefs";

const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000";

function cookieHeader(response: Response, existing = "") {
  const cookies = new Map(
    existing
      .split(";")
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => {
        const [name, ...rest] = value.split("=");
        return [name, rest.join("=")];
      }),
  );
  for (const setCookie of response.headers.getSetCookie()) {
    const [pair] = setCookie.split(";");
    const [name, ...rest] = pair.split("=");
    cookies.set(name, rest.join("="));
  }
  return [...cookies].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function login(email: string) {
  const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
  if (!csrfResponse.ok) throw new Error("Could not load Auth.js CSRF token");
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };
  let cookies = cookieHeader(csrfResponse);
  const loginResponse = await fetch(
    `${baseUrl}/api/auth/callback/credentials`,
    {
      method: "POST",
      redirect: "manual",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        cookie: cookies,
      },
      body: new URLSearchParams({
        csrfToken,
        email,
        password: "password123",
        callbackUrl: `${baseUrl}/app/work`,
      }),
    },
  );
  cookies = cookieHeader(loginResponse, cookies);
  if (loginResponse.status < 300 || loginResponse.status >= 400) {
    throw new Error(`${email} login failed with ${loginResponse.status}`);
  }
  return cookies;
}

async function checkRoutes(routes: string[], cookies: string) {
  for (const route of routes) {
    if (route.endsWith("/undefined")) throw new Error(`Missing seed for ${route}`);
    const response = await fetch(`${baseUrl}${route}`, {
      headers: { cookie: cookies },
      redirect: "manual",
    });
    const body = await response.text();
    if (response.status !== 200 || body.includes("Application error")) {
      throw new Error(`${route} failed with ${response.status}`);
    }
    if (
      route.startsWith("/api/financial-documents/") &&
      !response.headers.get("content-type")?.includes("application/pdf")
    ) {
      throw new Error(`${route} did not return a PDF`);
    }
    if (
      route === "/api/account/export" &&
      !response.headers.get("content-type")?.includes("application/json")
    ) {
      throw new Error(`${route} did not return a JSON export`);
    }
    console.log(`✓ ${route}`);
  }
}

async function checkStatus(
  route: string,
  expected: number,
  init?: RequestInit,
) {
  const response = await fetch(`${baseUrl}${route}`, {
    redirect: "manual",
    ...init,
  });
  if (response.status !== expected) {
    throw new Error(`${route} returned ${response.status}; expected ${expected}`);
  }
  console.log(`✓ ${route} → ${expected}`);
}

async function expectForbidden(
  label: string,
  operation: () => Promise<unknown>,
) {
  try {
    await operation();
  } catch (error) {
    if (
      error instanceof Error &&
      /forbidden|permission/i.test(error.message)
    ) {
      console.log(`✓ ${label} blocked`);
      return;
    }
    throw error;
  }
  throw new Error(`${label} unexpectedly succeeded`);
}

async function main() {
  await checkStatus("/terms", 200);
  await checkStatus("/privacy", 200);
  await checkStatus("/app", 307);
  const creatorCookies = await login("creator@woosh.test");
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost:5433/woosh?schema=public",
    }),
  });
  const creator = await prisma.creatorProfile.findFirstOrThrow({
    where: { user: { email: "creator@woosh.test" } },
    include: {
      applications: { take: 1, orderBy: { updatedAt: "desc" } },
      participants: { take: 1, orderBy: { createdAt: "desc" } },
      financialDocuments: { take: 1, orderBy: { generatedAt: "desc" } },
    },
  });
  const dispute = await prisma.dispute.findFirst({
    where: { obligation: { participant: { creatorProfileId: creator.id } } },
    orderBy: { createdAt: "desc" },
  });
  await checkRoutes([
    "/app/work",
    "/app/jobs",
    "/app/invitations",
    "/app/profile",
    "/app/insights",
    `/app/jobs/${creator.applications[0]?.briefId}`,
    `/app/campaigns/${creator.participants[0]?.campaignId}`,
    "/app/earnings",
    "/app/notifications",
    "/app/disputes",
    "/api/account/export",
    `/app/disputes/${dispute?.id}`,
    `/api/financial-documents/${creator.financialDocuments[0]?.id}`,
  ], creatorCookies);
  const brandCookies = await login("agency@woosh.test");
  await checkRoutes(
    [
      "/app/brands",
      "/app/creators",
      "/app/briefs",
      "/app/campaigns",
      "/app/messages",
      "/app/analytics",
      "/app/payments",
      "/app/notifications",
      "/app/disputes",
      "/app/team",
      "/app/settings",
    ],
    brandCookies,
  );
  const directBrandCookies = await login("brand@woosh.test");
  await checkRoutes(
    [
      "/app",
      "/app/creators",
      "/app/briefs",
      "/app/campaigns",
      "/app/messages",
      "/app/analytics",
      "/app/payments",
      "/app/notifications",
      "/app/disputes",
      "/app/team",
      "/app/settings",
    ],
    directBrandCookies,
  );
  const adminCookies = await login("admin@woosh.test");
  await checkRoutes(
    ["/app/admin", "/app/creators", "/app/briefs", "/app/analytics", "/app/notifications"],
    adminCookies,
  );

  const pendingEmail = "pending-smoke@woosh.test";
  await prisma.user.upsert({
    where: { email: pendingEmail },
    update: {
      status: "PENDING_VERIFICATION",
      emailVerified: null,
      passwordHash: await hash("password123", 4),
    },
    create: {
      email: pendingEmail,
      name: "Pending Smoke",
      status: "PENDING_VERIFICATION",
      passwordHash: await hash("password123", 4),
    },
  });
  const pendingCookies = await login(pendingEmail);
  const pendingApp = await fetch(`${baseUrl}/app`, {
    headers: { cookie: pendingCookies },
    redirect: "manual",
  });
  if (pendingApp.status === 200) {
    throw new Error("Unverified account reached the authenticated app");
  }
  console.log("✓ unverified account blocked");
  await prisma.user.delete({ where: { email: pendingEmail } });

  const agency = await prisma.organisation.findFirstOrThrow({
    where: { memberships: { some: { user: { email: "agency@woosh.test" } } } },
    include: { brands: { include: { briefs: { take: 1 } } } },
  });
  const viewerEmail = "viewer-smoke@woosh.test";
  const viewer = await prisma.user.create({
    data: {
      email: viewerEmail,
      name: "Viewer Smoke",
      status: "ACTIVE",
      emailVerified: new Date(),
      passwordHash: await hash("password123", 4),
      memberships: {
        create: { organisationId: agency.id, role: "VIEWER" },
      },
    },
  });
  const agencyBrief = agency.brands.flatMap((brand) => brand.briefs)[0];
  if (!agencyBrief) throw new Error("Missing agency brief seed");
  await expectForbidden("viewer brief creation", () =>
    createBrief(
      {
        brandId: agencyBrief.brandId,
        title: "Forbidden brief",
        description: "This should never be persisted by a viewer.",
        distribution: "OPEN",
        rateMode: "FIXED_NON_NEGOTIABLE",
        rateAmount: 100_000,
        currency: "NGN",
        channels: ["INSTAGRAM"],
      },
      viewer.id,
    ),
  );
  await expectForbidden("viewer creator invitation", () =>
    inviteToBrief({
      briefId: agencyBrief.id,
      creatorProfileId: creator.id,
      actorUserId: viewer.id,
    }),
  );
  await expectForbidden("viewer team invitation", () =>
    inviteTeammate({
      organisationId: agency.id,
      email: "forbidden-invite@woosh.test",
      role: "ADMIN",
      invitedById: viewer.id,
    }),
  );
  await prisma.user.delete({ where: { id: viewer.id } });

  await checkStatus("/api/internal/work-reminders", 503, { method: "POST" });
  await checkStatus("/api/internal/payment-releases", 503, { method: "POST" });
  await checkStatus("/api/internal/social-metrics", 503, { method: "POST" });
  await checkStatus("/api/internal/weekly-digests", 503, { method: "POST" });
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
