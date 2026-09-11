import { api } from "@/lib/api";

export async function listPayoutBanks() {
  return api<Array<{ name: string; code: string; active: boolean }>>(
    "/creators/me/payout-banks",
  );
}

export async function verifyAndSavePayoutAccount(input: {
  actorUserId: string;
  bankCode: string;
  accountNumber: string;
}) {
  return api("/creators/me/payout-account", {
    method: "POST",
    body: { bankCode: input.bankCode, accountNumber: input.accountNumber },
  });
}
