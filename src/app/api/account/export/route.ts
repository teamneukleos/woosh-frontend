import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildAccountDataExport } from "@/domains/identity/data-export";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await buildAccountDataExport(session.user.id);
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="woosh-account-export-${date}.json"`,
      "cache-control": "private, no-store",
    },
  });
}
