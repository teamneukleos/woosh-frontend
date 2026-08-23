import {
  DiscoveryMock,
  ProductFrame,
  ThreadMock,
  WalletMock,
} from "@/components/marketing/product-frame";
import { marketingCast } from "@/components/marketing/cast";

const items = [
  {
    title: "Nobody types a follower count",
    copy: "Instagram, TikTok, YouTube — live from the platform. Unclaimed prospects stay labelled. If they did not connect it, it is not claimed.",
    frame: "woosh.app / creators",
    mock: (
      <DiscoveryMock
        heading="Claimed + prospects"
        sub="Live metrics"
        rows={[
          {
            ...marketingCast.amaka,
            meta: "Abuja",
            channel: "TIKTOK",
            followers: "412k",
            verified: true,
          },
          {
            ...marketingCast.seyi,
            meta: "Lagos",
            channel: "INSTAGRAM",
            followers: "128k",
            verified: true,
          },
          {
            ...marketingCast.tolu,
            meta: "Kano",
            channel: "YOUTUBE",
            followers: "~45k est.",
            verified: false,
          },
        ]}
      />
    ),
  },
  {
    title: "Kill the group chat",
    copy: "Drafts, revisions, rights, deadlines — on the campaign. Not a disappearing WhatsApp. Not final_v7 in Drive.",
    frame: "woosh.app / campaign",
    mock: <ThreadMock />,
  },
  {
    title: "Naira first. We take 0%.",
    copy: "Fund the wallet before you pick anyone. The rate you agree is the rate that pays. Paystack. A ledger finance can actually read.",
    frame: "woosh.app / wallet",
    mock: <WalletMock />,
  },
];

export function BrandAdvantage() {
  return (
    <section id="advantage" className="border-t border-mkt-border bg-mkt-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="mkt-kicker">{"{The advantage}"}</p>
        <h2 className="font-display mt-4 max-w-xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
          Built for how Nigeria actually ships culture
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {items.map((item) => (
            <article key={item.title} className="flex flex-col">
              <ProductFrame title={item.frame}>{item.mock}</ProductFrame>
              <h3 className="mt-5 text-[1.0625rem] font-medium tracking-[-0.015em] text-mkt-fg">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-mkt-subtle">{item.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
