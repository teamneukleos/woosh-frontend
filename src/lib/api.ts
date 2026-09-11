import { auth } from "@/lib/auth";
import { getActiveBrandId } from "@/lib/brand-cookie";
import { ApiError, nestRequest, nestRequestBytes } from "@/lib/nest";

type ApiInit = {
  method?: string;
  body?: unknown;
  brandId?: string | null;
  accessToken?: string;
};

export { ApiError };

export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const session = await auth();
  const accessToken = init.accessToken ?? session?.accessToken;
  if (!accessToken || session?.error === "RefreshFailed") {
    throw new ApiError(401, "Unauthorized");
  }
  const brandId =
    init.brandId === undefined ? await getActiveBrandId() : init.brandId;

  try {
    return await nestRequest<T>(path, {
      method: init.method,
      body: init.body,
      brandId,
      accessToken,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const retry = await auth();
      if (!retry?.accessToken || retry.accessToken === accessToken) throw error;
      return nestRequest<T>(path, {
        method: init.method,
        body: init.body,
        brandId,
        accessToken: retry.accessToken,
      });
    }
    throw error;
  }
}

export async function apiBytes(
  path: string,
  init: ApiInit = {},
) {
  const session = await auth();
  const accessToken = init.accessToken ?? session?.accessToken;
  if (!accessToken || session?.error === "RefreshFailed") {
    throw new ApiError(401, "Unauthorized");
  }
  const brandId =
    init.brandId === undefined ? await getActiveBrandId() : init.brandId;

  try {
    return await nestRequestBytes(path, {
      method: init.method,
      brandId,
      accessToken,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const retry = await auth();
      if (!retry?.accessToken || retry.accessToken === accessToken) throw error;
      return nestRequestBytes(path, {
        method: init.method,
        brandId,
        accessToken: retry.accessToken,
      });
    }
    throw error;
  }
}

export async function publicApi<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
) {
  return nestRequest<T>(path, init);
}
