"use client";

import { useState } from "react";
import { ProductFrame } from "@/components/marketing/product-frame";

const clients = [
  {
    name: "Palm Cola",
    available: "₦2,450,000",
    committed: "₦480,000",
    briefs: "2 live",
  },
  {
    name: "Kora Beauty",
    available: "₦890,000",
    committed: "₦210,000",
    briefs: "1 draft",
  },
];

export function ClientWallets() {
  const [active, setActive] = useState(clients[0].name);
  const current = clients.find((c) => c.name === active) ?? clients[0];

  return (
    <ProductFrame title="woosh.app / agency · switch client">
      <div className="grid gap-3">
        <p className="text-[0.65rem] text-white/40">
          Workspace context · NGN ledgers do not mix
        </p>
        <div className="flex gap-1 rounded-lg bg-white/[0.04] p-1">
          {clients.map((client) => (
            <button
              key={client.name}
              type="button"
              onClick={() => setActive(client.name)}
              className={
                client.name === active
                  ? "flex-1 rounded-md bg-[#003af4] px-2 py-1.5 text-[0.7rem] font-medium text-white"
                  : "flex-1 rounded-md px-2 py-1.5 text-[0.7rem] text-white/50"
              }
            >
              {client.name}
            </button>
          ))}
        </div>
        <div className="rounded-lg mkt-inset p-3">
          <p className="text-[0.65rem] text-white/40">{current.name} wallet</p>
          <p className="mt-1 text-lg font-medium tracking-[-0.03em] text-white">
            {current.available}
          </p>
          <div className="mt-3 flex justify-between text-[0.65rem] text-white/45">
            <span>Committed {current.committed}</span>
            <span>{current.briefs}</span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {clients.map((client) => (
            <div
              key={`${client.name}-card`}
              className={
                client.name === active
                  ? "rounded-lg border border-[#0de3af]/40 bg-white/[0.04] p-3"
                  : "rounded-lg mkt-inset p-3 opacity-60"
              }
            >
              <p className="text-[0.65rem] text-white/40">{client.name}</p>
              <p className="mt-1 text-sm font-medium text-white">{client.available}</p>
            </div>
          ))}
        </div>
      </div>
    </ProductFrame>
  );
}
