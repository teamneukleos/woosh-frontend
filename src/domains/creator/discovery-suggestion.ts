import type { SocialChannel } from "@/lib/enums";

export type DiscoverySuggestion = {
  id: string;
  type: "claimed" | "prospect";
  displayName: string;
  handle?: string;
  channel?: SocialChannel;
};

export async function searchDiscoverySuggestions(q: string) {
  const params = new URLSearchParams({ q });

  const response = await fetch(
    `/api/creators/discovery/suggestions?${params.toString()}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error("Unable to load creator suggestions");
  }

  return (await response.json()) as DiscoverySuggestion[];
}