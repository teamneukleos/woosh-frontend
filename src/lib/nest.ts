export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type NestTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

export type NestMe = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  status: string;
  emailVerified: string | Date | null;
  emailNotifications?: boolean;
  weeklyDigest?: boolean;
  isPlatformAdmin: boolean;
  seat: "creator" | "brand" | "agency" | "admin";
  creatorProfile: {
    id: string;
    displayName: string;
    marketplaceStatus: string;
  } | null;
  organisation: {
    id: string;
    type: string;
    publicName: string;
    verifiedAt: string | Date | null;
    role: string | null;
  } | null;
  brands: Array<{ id: string; name: string; organisationId: string }>;
};

export function nestApiUrl() {
  const raw =
    process.env.WOOSH_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://localhost:4000/api";
  return raw.replace(/\/$/, "");
}

export function nestErrorMessage(body: unknown, status: number) {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) return message.filter(Boolean).join(". ");
    if (typeof message === "string" && message.trim()) return message;
  }
  return `Request failed (${status})`;
}

export async function nestRequest<T>(
  path: string,
  init: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    brandId?: string | null;
    accessToken?: string | null;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.headers ?? {}),
  };
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (init.accessToken) headers.Authorization = `Bearer ${init.accessToken}`;
  if (init.brandId) headers["X-Brand-Id"] = init.brandId;

  const response = await fetch(`${nestApiUrl()}${path.startsWith("/") ? path : `/${path}`}`, {
    method: init.method ?? "GET",
    headers,
    body:
      init.body === undefined
        ? undefined
        : isFormData
          ? (init.body as FormData)
          : JSON.stringify(init.body),
    cache: "no-store",
  });

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = text;
    }
  }
  if (!response.ok) {
    throw new ApiError(response.status, nestErrorMessage(parsed, response.status));
  }
  return parsed as T;
}

export async function nestRequestBytes(
  path: string,
  init: {
    method?: string;
    headers?: Record<string, string>;
    brandId?: string | null;
    accessToken?: string | null;
  } = {},
) {
  const headers: Record<string, string> = {
    Accept: "application/pdf, application/json",
    ...(init.headers ?? {}),
  };
  if (init.accessToken) headers.Authorization = `Bearer ${init.accessToken}`;
  if (init.brandId) headers["X-Brand-Id"] = init.brandId;

  const response = await fetch(
    `${nestApiUrl()}${path.startsWith("/") ? path : `/${path}`}`,
    {
      method: init.method ?? "GET",
      headers,
      cache: "no-store",
    },
  );
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!response.ok) {
    let parsed: unknown = buffer.toString("utf8");
    try {
      parsed = JSON.parse(String(parsed)) as unknown;
    } catch {
      /* keep raw text */
    }
    throw new ApiError(response.status, nestErrorMessage(parsed, response.status));
  }
  return {
    buffer,
    contentType: response.headers.get("content-type") || "application/octet-stream",
    contentDisposition: response.headers.get("content-disposition"),
  };
}

export async function loginWithPassword(email: string, password: string) {
  const tokens = await nestRequest<NestTokens>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  const me = await nestRequest<NestMe>("/auth/me", {
    accessToken: tokens.accessToken,
  });
  return { tokens, me };
}

export async function refreshNestTokens(refreshToken: string) {
  return nestRequest<NestTokens>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
}

export async function logoutNest(refreshToken: string) {
  try {
    await nestRequest("/auth/logout", {
      method: "POST",
      body: { refreshToken },
    });
  } catch {
    /* token may already be revoked */
  }
}

export function asDate(value: string | Date | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}
