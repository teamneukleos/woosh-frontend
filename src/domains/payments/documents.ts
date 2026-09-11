import { api, apiBytes } from "@/lib/api";

export async function createBrandReceipt(_obligationId: string) {
  return null;
}

export async function createCreatorStatement(input: {
  actorUserId: string;
  year: number;
  month: number;
}) {
  return api("/creators/me/statements", {
    method: "POST",
    body: { year: input.year, month: input.month },
  });
}

export type FinancialDocumentRow = {
  id: string;
  documentNumber: string;
  type: string;
  generatedAt: string;
};

export async function listCreatorDocuments() {
  return api<FinancialDocumentRow[]>("/creators/me/documents");
}

export async function listBrandDocuments(brandId: string) {
  return api<FinancialDocumentRow[]>("/payments/documents", { brandId });
}

export async function downloadFinancialDocumentPdf(documentId: string) {
  return apiBytes(`/payments/documents/${documentId}/pdf`);
}
