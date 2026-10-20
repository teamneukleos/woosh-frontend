"use client";

import { useEffect, useState, useTransition } from "react";
import {
  createWalletDvaAction,
  listDvaBanksAction,
  walletTopUpAction,
} from "@/app/actions";
import type { BrandDva } from "@/domains/payments/dva";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { cn } from "@/lib/cn";

function splitName(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function WalletFundPanel({
  canPay,
  brandName,
  initialDva,
  defaultName,
  defaultPhone,
}: {
  canPay: boolean;
  brandName: string;
  initialDva: BrandDva | null;
  defaultName: string | null;
  defaultPhone: string | null;
}) {
  const names = splitName(defaultName);
  const [method, setMethod] = useState<"card" | "transfer">("card");
  const [dva, setDva] = useState(initialDva);
  const [status, setStatus] = useState<
    "ready" | "needs_identification" | "pending" | null
  >(initialDva ? "ready" : null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [banks, setBanks] = useState<Array<{ name: string; code: string }>>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setDva(initialDva);
    if (initialDva) setStatus("ready");
  }, [initialDva]);

  useEffect(() => {
    if (status !== "needs_identification") return;
    void listDvaBanksAction()
      .then((row) => setBanks(row.banks))
      .catch(() => undefined);
  }, [status]);

  return (
    <div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMethod("card")}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium",
            method === "card"
              ? "bg-[var(--woosh-blue)] text-white"
              : "bg-[var(--surface-sunken)] text-[var(--text-muted)]",
          )}
        >
          Card
        </button>
        <button
          type="button"
          onClick={() => setMethod("transfer")}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium",
            method === "transfer"
              ? "bg-[var(--woosh-blue)] text-white"
              : "bg-[var(--surface-sunken)] text-[var(--text-muted)]",
          )}
        >
          Bank transfer
        </button>
      </div>

      {method === "card" ? (
        <>
          <ActionForm
            action={walletTopUpAction}
            successTitle="Redirecting to Paystack"
            className="mt-4"
          >
            <div className="flex flex-wrap items-end gap-3">
              <Label className="min-w-0 w-full sm:w-auto sm:min-w-[12rem]">
                Amount (NGN)
                <Input
                  name="amount"
                  type="number"
                  min={1000}
                  step={1000}
                  defaultValue={100000}
                  required
                  disabled={!canPay}
                />
              </Label>
              {canPay ? <Button type="submit">Add funds</Button> : null}
            </div>
          </ActionForm>
          <p className="mt-3 text-xs text-[var(--woosh-dull)]/65">
            Opens Paystack Checkout. After you pay, we verify the charge and
            credit {brandName}&apos;s wallet.
          </p>
        </>
      ) : dva ? (
        <div className="mt-4 grid gap-3 rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-[var(--surface-sunken)] p-4 text-sm">
          <p className="text-[var(--text-muted)]">
            Transfer to this account for <strong>{brandName}</strong>. Only this
            brand&apos;s wallet is credited.
          </p>
          <p>
            <span className="text-[var(--text-muted)]">Bank</span>
            <br />
            {dva.bankName || "Paystack"}
          </p>
          <p>
            <span className="text-[var(--text-muted)]">Account name</span>
            <br />
            {dva.accountName || "—"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-lg tracking-wide text-[var(--text-strong)]">
              {dva.accountNumber}
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(dva.accountNumber);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="text-xs text-[var(--woosh-dull)]/65">
            Any NGN amount lands on this wallet after Paystack confirms the
            transfer. Keep this number for {brandName} only.
          </p>
        </div>
      ) : (
        <form
          className="mt-4 grid max-w-md gap-3"
          action={(formData) => {
            formData.set("consent", "true");
            startTransition(async () => {
              const result = await createWalletDvaAction(formData);
              setStatus(result.status);
              setMessage(result.message ?? null);
              setDva(result.dva);
            });
          }}
        >
          <p className="text-sm text-[var(--text-muted)]">
            We create a dedicated NUBAN for this brand the first time you pay by
            transfer — not at signup.
          </p>
          <Label>
            First name
            <Input name="firstName" required defaultValue={names.firstName} />
          </Label>
          <Label>
            Last name
            <Input name="lastName" required defaultValue={names.lastName} />
          </Label>
          <Label>
            Phone
            <Input
              name="phone"
              required
              defaultValue={defaultPhone ?? ""}
              placeholder="0801 234 5678"
            />
          </Label>
          {status === "needs_identification" ? (
            <>
              <p className="text-sm text-[var(--text-muted)]">
                {message ||
                  "Paystack needs a BVN and a matching bank account to name the virtual account. We do not store the BVN."}
              </p>
              <Label>
                BVN
                <Input
                  name="bvn"
                  required
                  inputMode="numeric"
                  pattern="\d{11}"
                  maxLength={11}
                  autoComplete="off"
                />
              </Label>
              <Label>
                Bank
                <Select name="bankCode" required defaultValue="">
                  <option value="">Select bank</option>
                  {banks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </Select>
              </Label>
              <Label>
                Account number on that BVN
                <Input
                  name="accountNumber"
                  required
                  inputMode="numeric"
                  pattern="\d{10}"
                  maxLength={10}
                />
              </Label>
            </>
          ) : null}
          {status === "pending" && message ? (
            <p className="text-sm text-[var(--text-muted)]">{message}</p>
          ) : null}
          <label className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
            <input type="checkbox" required className="mt-1" />
            <span>
              I agree that Woosh may create a dedicated bank account in this
              name for {brandName} only.
            </span>
          </label>
          {canPay ? (
            <Button type="submit" disabled={pending} className="w-fit">
              {pending ? "Creating account…" : "Get transfer details"}
            </Button>
          ) : null}
        </form>
      )}
    </div>
  );
}
