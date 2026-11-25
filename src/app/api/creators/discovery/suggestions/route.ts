import { NextResponse } from "next/server";
import { api, ApiError } from "@/lib/api";
import type { DiscoverySuggestion } from "@/domains/creator/discovery-suggestion";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";

  try {
    const suggestions = await api<DiscoverySuggestion[]>(
      `/creators/discovery/suggestions?q=${encodeURIComponent(q)}`,
    );

    return NextResponse.json(suggestions, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load creator suggestions",
      },
      { status },
    );
  }
}