import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/domains/organisation/invites";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");
  if (!token || !email) {
    return NextResponse.redirect(new URL("/login?verify=invalid", req.url));
  }
  try {
    await verifyEmailToken(email, token);
    return NextResponse.redirect(new URL("/login?verify=ok", req.url));
  } catch {
    return NextResponse.redirect(new URL("/login?verify=invalid", req.url));
  }
}
