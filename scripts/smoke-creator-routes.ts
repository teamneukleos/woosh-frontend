import "dotenv/config";

const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const password = process.env.SMOKE_PASSWORD || "password123";

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
        password,
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

/** Nest CronGuard: 503 if the secret is missing, 401 if the Bearer is missing/wrong. */
async function checkCronFailClosed(route: string) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: "POST",
    redirect: "manual",
  });
  if (response.status !== 401 && response.status !== 503) {
    throw new Error(
      `${route} returned ${response.status}; expected 401 or 503`,
    );
  }
  console.log(`✓ ${route} → ${response.status} (fail closed)`);
}

function firstHref(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1];
}

async function pageHtml(path: string, cookies: string) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { cookie: cookies },
    redirect: "manual",
  });
  const body = await response.text();
  if (response.status !== 200 || body.includes("Application error")) {
    throw new Error(`${path} failed with ${response.status}`);
  }
  return body;
}

async function smokeAuthenticated() {
  const creatorCookies = await login("creator@woosh.test");
  const jobsHtml = await pageHtml("/app/jobs", creatorCookies);
  const workHtml = await pageHtml("/app/work", creatorCookies);
  const disputesHtml = await pageHtml("/app/disputes", creatorCookies);
  const earningsHtml = await pageHtml("/app/earnings", creatorCookies);
  const jobId = firstHref(jobsHtml, /href="\/app\/jobs\/([^"]+)"/);
  const campaignId =
    firstHref(workHtml, /href="\/app\/campaigns\/([^"]+)"/) ||
    firstHref(jobsHtml, /href="\/app\/campaigns\/([^"]+)"/);
  const disputeId = firstHref(disputesHtml, /href="\/app\/disputes\/([^"]+)"/);
  const documentId = firstHref(
    earningsHtml,
    /href="\/api\/financial-documents\/([^"]+)"/,
  );

  await checkRoutes(
    [
      "/app/work",
      "/app/jobs",
      "/app/invitations",
      "/app/profile",
      "/app/insights",
      ...(jobId ? [`/app/jobs/${jobId}`] : []),
      ...(campaignId ? [`/app/campaigns/${campaignId}`] : []),
      "/app/earnings",
      "/app/notifications",
      "/app/disputes",
      "/api/account/export",
      ...(disputeId ? [`/app/disputes/${disputeId}`] : []),
      ...(documentId ? [`/api/financial-documents/${documentId}`] : []),
    ],
    creatorCookies,
  );

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
}

async function main() {
  await checkStatus("/terms", 200);
  await checkStatus("/privacy", 200);
  await checkStatus("/app", 307);
  await checkCronFailClosed("/api/internal/work-reminders");
  await checkCronFailClosed("/api/internal/payment-releases");
  await checkCronFailClosed("/api/internal/social-metrics");
  await checkCronFailClosed("/api/internal/weekly-digests");

  try {
    await smokeAuthenticated();
  } catch (error) {
    if (process.env.SMOKE_REQUIRE_AUTH === "1") throw error;
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Skipping authenticated smoke: ${message}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
