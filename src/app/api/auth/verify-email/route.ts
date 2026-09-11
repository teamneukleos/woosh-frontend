import { NextResponse } from "next/server";
import { publicApi } from "@/lib/api";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?verify=invalid", req.url));
  }
  try {
    await publicApi("/auth/verify-email", {
      method: "POST",
      body: { token },
    });
    return NextResponse.redirect(new URL("/login?verify=ok", req.url));
  } catch {
    return NextResponse.redirect(new URL("/login?verify=invalid", req.url));
  }
}
