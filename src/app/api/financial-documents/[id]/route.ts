import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  renderFinancialDocumentPdf,
  requireFinancialDocument,
} from "@/domains/payments/documents";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const document = await requireFinancialDocument(id, session.user.id);
    const pdf = await renderFinancialDocumentPdf(document);
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${document.documentNumber}.pdf"`,
        "cache-control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
