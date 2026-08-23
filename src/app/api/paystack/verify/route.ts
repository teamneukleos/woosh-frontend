import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyTransaction } from "@/lib/paystack";
import { creditWalletFromPaystack } from "@/domains/payments/wallet";
import { requireBrandFinanceAccess } from "@/domains/payments/access";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference");
  if (!reference) {
    return NextResponse.redirect(new URL("/app/payments?funded=error", request.url));
  }
  try {
    const verified = await verifyTransaction(reference);
    if (verified.status !== "success") throw new Error("Payment not successful");
    const brandId = String(verified.metadata?.brandId ?? "");
    if (!brandId) throw new Error("Missing brand");
    await requireBrandFinanceAccess(brandId, session.user.id);
    await creditWalletFromPaystack({
      reference,
      amountKobo: verified.amount,
      brandId,
    });
    return NextResponse.redirect(new URL("/app/payments?funded=1", request.url));
  } catch {
    return NextResponse.redirect(new URL("/app/payments?funded=error", request.url));
  }
}
