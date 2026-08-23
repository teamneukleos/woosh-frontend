import { cn } from "@/lib/cn";
import { formatHandle } from "@/lib/handle";
import { SocialIcon } from "@/components/ui/social-icon";
import { marketingCast, marketingPhotos } from "@/components/marketing/cast";

function Face({
  name,
  src,
  size = "sm",
  className,
}: {
  name: string;
  src: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className={cn(
        "shrink-0 rounded-full object-cover object-[center_20%] shadow-[0_2px_6px_rgb(0_0_0_/_0.2)]",
        size === "md" ? "size-10" : "size-8",
        className,
      )}
    />
  );
}

export function ProductFrame({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mkt-mock mkt-lift overflow-hidden rounded-[1.1rem] bg-[#0b0d14] transition-transform duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:rotate-[0.4deg]",
        className,
      )}
    >
      <div className="flex items-center gap-2 bg-white/[0.03] px-3.5 py-2.5">
        <span className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <p className="ml-2 truncate text-[0.6875rem] text-white/40">{title}</p>
      </div>
      <div className="bg-[linear-gradient(180deg,#12141c_0%,#0b0d14_100%)] p-3 sm:p-4">
        {children}
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-[#003af4]" aria-hidden>
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path
        d="M4.6 8.2 6.8 10.3 11.4 5.6"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DiscoveryMock({
  heading = "Creators",
  sub = "Open · funded",
  rows = [
    { ...marketingCast.ada, meta: "Lagos", channel: "TIKTOK", followers: "248k", verified: true },
    { ...marketingCast.kelechi, meta: "Abuja", channel: "INSTAGRAM", followers: "91k", verified: true },
    { ...marketingCast.tomiwa, meta: "Ibadan", channel: "YOUTUBE", followers: "64k", verified: false },
  ],
}: {
  heading?: string;
  sub?: string;
  rows?: Array<{
    name: string;
    handle: string;
    src: string;
    meta: string;
    channel: string;
    followers: string;
    verified: boolean;
  }>;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-[0.65rem] text-white/40">
        <span>{heading}</span>
        <span>{sub}</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.handle}
          className="flex items-center justify-between gap-3 rounded-lg mkt-inset px-3 py-2.5"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <Face name={row.name} src={row.src} />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-white">
                <span className="truncate">{formatHandle(row.handle)}</span>
                {row.verified ? <Check /> : null}
              </p>
              <p className="flex items-center gap-1.5 truncate text-[0.6875rem] text-white/40">
                <SocialIcon channel={row.channel} size="sm" />
                <span className="truncate">
                  {row.verified ? row.meta : "Unverified prospect"}
                </span>
              </p>
            </div>
          </div>
          <p className="shrink-0 text-[0.75rem] text-white/70">{row.followers}</p>
        </div>
      ))}
    </div>
  );
}

export function StorefrontMock() {
  return (
    <div className="mkt-inset overflow-hidden rounded-lg">
      <div className="relative h-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={marketingPhotos.osCreator}
          alt=""
          className="h-full w-full object-cover object-[center_18%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] to-transparent" />
      </div>
      <div className="bg-white/[0.03] px-3 pb-3">
        <Face
          name={marketingCast.amaka.name}
          src={marketingCast.amaka.src}
          size="md"
          className="-mt-5 ring-[#0b0d14]"
        />
        <p className="mt-3 flex items-center gap-1.5 text-[0.8125rem] font-medium text-white">
          {formatHandle(marketingCast.amaka.handle)} <Check />
        </p>
        <p className="mt-1 text-[0.6875rem] text-white/40">
          {marketingCast.amaka.name} · Abuja · Lifestyle
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ["412k", "Followers"],
            ["5.1%", "ER"],
            ["₦95k", "From"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-md bg-white/[0.04] py-2">
              <p className="text-[0.75rem] font-medium text-white">{v}</p>
              <p className="text-[0.6rem] text-white/40">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BriefPipelineMock() {
  const rows = [
    { person: marketingCast.amaka, status: "Applied", rate: "₦95,000" },
    { person: marketingCast.seyi, status: "Shortlisted", rate: "₦210,000" },
    { person: marketingCast.kelechi, status: "Offer", rate: "₦175,000" },
  ];
  return (
    <div className="grid gap-2">
      <p className="text-[0.65rem] text-white/40">Kora Beauty · Launch kit</p>
      {rows.map((row) => (
        <div
          key={row.person.short}
          className="flex items-center justify-between gap-3 rounded-lg mkt-inset px-3 py-2.5"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <Face name={row.person.name} src={row.person.src} />
            <div className="min-w-0">
              <p className="truncate text-[0.8125rem] text-white">
                {formatHandle(row.person.handle)}
              </p>
              <p className="text-[0.65rem] text-[#0de3af]/80">{row.status}</p>
            </div>
          </div>
          <p className="shrink-0 text-[0.75rem] text-white/70">{row.rate}</p>
        </div>
      ))}
    </div>
  );
}

export function WorkspaceMock() {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_0.9fr]">
      <div className="overflow-hidden rounded-lg mkt-inset">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={marketingPhotos.draft}
          alt=""
          className="h-36 w-full object-cover object-[center_35%]"
        />
        <div className="p-3">
          <p className="text-[0.65rem] text-white/40">Deliverable</p>
          <p className="mt-1 text-[0.8125rem] font-medium text-white">Feed post · Draft v2</p>
          <p className="mt-2 text-[0.6875rem] leading-5 text-white/45">
            Brand notes: keep the teal pack in frame. Posting window 1–15 Oct.
          </p>
        </div>
      </div>
      <div className="rounded-lg mkt-inset p-3">
        <p className="text-[0.65rem] text-white/40">Payout</p>
        <p className="mt-1 text-[0.8125rem] font-medium text-white">₦148,500 net</p>
        <p className="mt-2 text-[0.6875rem] text-white/45">Committed · 72h after approve</p>
      </div>
    </div>
  );
}

export function DeliverMock() {
  const rows = [
    { label: "Draft submitted", detail: "Story frame · @kelechi.nwosu", tone: "muted" },
    { label: "Revision requested", detail: "Keep pack shot in frame", tone: "blue" },
    { label: "Approved", detail: "Reel · @amaka.creates", tone: "teal" },
  ] as const;
  return (
    <div className="grid gap-2">
      <p className="text-[0.65rem] text-white/40">Palm Cola · Summer splash</p>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-start gap-3 rounded-lg mkt-inset px-3 py-2.5"
        >
          <span
            className={cn(
              "mt-1.5 size-1.5 shrink-0 rounded-full",
              row.tone === "teal"
                ? "bg-[#0de3af]"
                : row.tone === "blue"
                  ? "bg-[#003af4]"
                  : "bg-white/30",
            )}
          />
          <div className="min-w-0">
            <p className="text-[0.8125rem] text-white">{row.label}</p>
            <p className="mt-0.5 truncate text-[0.65rem] text-white/40">{row.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ThreadMock() {
  const trail = [
    {
      src: marketingPhotos.studio,
      position: "object-[center_30%]",
      title: "Story frame · Live",
      handle: marketingCast.amaka.handle,
      status: "Approved",
    },
    {
      src: marketingPhotos.street,
      position: "object-[center_18%]",
      title: "Reel · Revision 1",
      handle: marketingCast.tomiwa.handle,
      status: "Changes",
    },
  ];
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-[0.65rem] text-white/40">
        <span>Kora Beauty · Launch kit</span>
        <span>Active thread</span>
      </div>
      <div className="overflow-hidden rounded-lg mkt-inset">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={marketingPhotos.draft}
          alt=""
          className="h-[5.25rem] w-full object-cover object-[center_35%]"
        />
        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-[0.8125rem] font-medium text-white">
              Feed post · Draft v2
            </p>
            <p className="mt-0.5 truncate text-[0.6875rem] text-white/40">
              {formatHandle(marketingCast.kelechi.handle)} · Due 18 Sep
            </p>
          </div>
          <p className="shrink-0 text-[0.65rem] text-[#0de3af]/80">In review</p>
        </div>
      </div>
      {trail.map((row) => (
        <div
          key={row.title}
          className="flex items-center justify-between gap-3 rounded-lg mkt-inset px-3 py-2.5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.src}
            alt=""
            className={`size-8 shrink-0 rounded-md object-cover ${row.position}`}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.8125rem] font-medium text-white">{row.title}</p>
            <p className="truncate text-[0.6875rem] text-white/40">
              {formatHandle(row.handle)}
            </p>
          </div>
          <p className="shrink-0 text-[0.65rem] text-[#0de3af]/80">{row.status}</p>
        </div>
      ))}
    </div>
  );
}

export function PayMock() {
  return (
    <div className="grid gap-2">
      <div className="rounded-lg mkt-inset p-3">
        <p className="text-[0.65rem] text-white/40">Creator wallet</p>
        <p className="mt-1 text-xl font-medium tracking-[-0.03em] text-white">₦387,500</p>
        <p className="mt-1 text-[0.65rem] text-white/45">Available · Paystack</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg mkt-inset px-3 py-2">
          <p className="text-[0.6rem] text-white/40">Committed</p>
          <p className="mt-0.5 text-[0.8125rem] font-medium text-white">₦148,500</p>
        </div>
        <div className="rounded-lg mkt-inset px-3 py-2">
          <p className="text-[0.6rem] text-white/40">Releasing</p>
          <p className="mt-0.5 text-[0.8125rem] font-medium text-white">₦72,000</p>
        </div>
      </div>
    </div>
  );
}

export function WalletMock() {
  const lines = [
    { label: "Available", value: "₦2,450,000", hint: "Palm Cola wallet" },
    { label: "Committed", value: "₦480,000", hint: "3 live campaigns" },
    { label: "Releasing", value: "₦162,000", hint: "72h after approve" },
  ];
  const ledger = [
    { who: formatHandle(marketingCast.kelechi.handle), state: "Releasing", amount: "₦162,000" },
    { who: formatHandle(marketingCast.amaka.handle), state: "Committed", amount: "₦95,000" },
    { who: "Paystack fund", state: "Settled", amount: "₦2,450,000" },
  ];
  return (
    <div className="grid gap-2">
      <p className="text-[0.65rem] text-white/40">Brand wallet</p>
      <div className="grid grid-cols-3 gap-1.5">
        {lines.map((line) => (
          <div
            key={line.label}
            className="rounded-lg mkt-inset px-2 py-2"
          >
            <p className="text-[0.6rem] text-white/40">{line.label}</p>
            <p className="mt-1 text-[0.7rem] font-medium tracking-[-0.02em] text-white">
              {line.value}
            </p>
          </div>
        ))}
      </div>
      <div className="grid gap-1.5">
        {ledger.map((row) => (
          <div
            key={row.who}
            className="flex items-center justify-between gap-2 rounded-lg mkt-inset px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-[0.75rem] text-white">{row.who}</p>
              <p className="text-[0.6rem] text-[#0de3af]/80">{row.state}</p>
            </div>
            <p className="shrink-0 text-[0.75rem] font-medium text-white">{row.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
