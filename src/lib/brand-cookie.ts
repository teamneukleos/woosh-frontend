import { cookies } from "next/headers";

export const ACTIVE_BRAND_COOKIE = "woosh_active_brand";

export async function getActiveBrandId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACTIVE_BRAND_COOKIE)?.value ?? null;
}

export async function setActiveBrandId(brandId: string) {
  const jar = await cookies();
  jar.set(ACTIVE_BRAND_COOKIE, brandId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearActiveBrandId() {
  const jar = await cookies();
  jar.delete(ACTIVE_BRAND_COOKIE);
}
