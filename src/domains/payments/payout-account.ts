import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import {
  createTransferRecipient,
  listPaystackBanks,
  paystackConfigured,
  resolvePaystackAccount,
} from "@/lib/paystack";
import {
  encryptAccountNumber,
} from "@/lib/payout-account-crypto";
import { requireCreatorActor } from "@/domains/work/access";
import { assertProductionPaymentConfiguration } from "@/domains/payments/policy";

const DEV_BANKS = [
  { name: "Access Bank", code: "044", active: true },
  { name: "First Bank of Nigeria", code: "011", active: true },
  { name: "Guaranty Trust Bank", code: "058", active: true },
  { name: "United Bank for Africa", code: "033", active: true },
  { name: "Zenith Bank", code: "057", active: true },
];

export async function listPayoutBanks() {
  assertProductionPaymentConfiguration();
  if (!paystackConfigured()) return DEV_BANKS;
  return (await listPaystackBanks()).filter((bank) => bank.active);
}

export async function verifyAndSavePayoutAccount(input: {
  actorUserId: string;
  bankCode: string;
  accountNumber: string;
}) {
  const actor = await requireCreatorActor(input.actorUserId);
  assertProductionPaymentConfiguration();
  const bankCode = input.bankCode.trim();
  const accountNumber = input.accountNumber.replace(/\s/g, "");
  if (!/^\d{10}$/.test(accountNumber)) {
    throw new Error("Enter a valid 10-digit NUBAN account number");
  }
  const banks = await listPayoutBanks();
  const bank = banks.find((item) => item.code === bankCode);
  if (!bank) throw new Error("Select a supported bank");
  const resolved = paystackConfigured()
    ? await resolvePaystackAccount({ accountNumber, bankCode })
    : {
        account_number: accountNumber,
        account_name: "Verified development account",
      };
  const recipient = paystackConfigured()
    ? await createTransferRecipient({
        name: resolved.account_name,
        accountNumber,
        bankCode,
        currency: "NGN",
      })
    : { recipient_code: `DEV_${actor.creatorProfileId}` };
  const saved = await prisma.creatorPayoutAccount.upsert({
    where: { creatorProfileId: actor.creatorProfileId },
    create: {
      creatorProfileId: actor.creatorProfileId,
      bankCode,
      bankName: bank.name,
      accountName: resolved.account_name,
      encryptedAccountNumber: encryptAccountNumber(accountNumber),
      accountNumberLast4: accountNumber.slice(-4),
      recipientCode: recipient.recipient_code,
      verifiedAt: new Date(),
      verificationReference: `paystack:${recipient.recipient_code}`,
    },
    update: {
      bankCode,
      bankName: bank.name,
      accountName: resolved.account_name,
      accountNumber: null,
      encryptedAccountNumber: encryptAccountNumber(accountNumber),
      accountNumberLast4: accountNumber.slice(-4),
      recipientCode: recipient.recipient_code,
      verifiedAt: new Date(),
      verificationReference: `paystack:${recipient.recipient_code}`,
    },
  });
  await writeAudit({
    actorId: input.actorUserId,
    action: "payout_account.verify",
    targetType: "CreatorPayoutAccount",
    targetId: saved.id,
    after: { bankCode, last4: accountNumber.slice(-4) },
  });
  return saved;
}
