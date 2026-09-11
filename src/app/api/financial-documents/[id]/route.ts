import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { downloadFinancialDocumentPdf } from "@/domains/payments/documents";

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
    const pdf = await downloadFinancialDocumentPdf(id);
    return new NextResponse(new Uint8Array(pdf.buffer), {
      headers: {
        "content-type": pdf.contentType,
        "content-disposition":
          pdf.contentDisposition || `attachment; filename="${id}.pdf"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 404;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Not found" },
      { status: status === 401 ? 401 : 404 },
    );
  }
}
