import Image from "next/image";
import { ProductFrame, WorkspaceMock } from "@/components/marketing/product-frame";
import { marketingPhotos } from "@/components/marketing/cast";

const claims = [
  {
    title: "One brand, one wallet",
    copy: "Each brand keeps its own briefs, campaigns and funds. Switch context without mixing client money.",
  },
  {
    title: "Work stays on the work",
    copy: "Messages, drafts and approvals stay on the campaign — not a side chat that expires.",
  },
  {
    title: "Every naira has a state",
    copy: "Committed, releasing, paid and disputed — on one ledger. Creators see net before they accept.",
  },
  {
    title: "Roles that actually hold",
    copy: "Owners, finance and managers. Rates above threshold need elevated approval.",
  },
];

export function BrandWorkspace() {
  return (
    <section className="border-t border-white/10 bg-black py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="mkt-kicker">{"{The workspace}"}</p>
        <h2 className="font-display mt-4 max-w-xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-white">
          When the campaign is bigger than one tab.
        </h2>

        <div className="relative mt-12 overflow-hidden rounded-[1.75rem]">
          <div className="relative min-h-[28rem] md:min-h-[36rem]">
            <Image
              src={marketingPhotos.workspace}
              alt="A city billboard campaign running at building scale"
              fill
              sizes="(min-width: 1152px) 1152px, 100vw"
              quality={95}
              className="object-cover object-[center_40%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/25 md:via-black/55 md:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

            <div className="relative flex min-h-[28rem] flex-col justify-between gap-10 p-6 md:min-h-[36rem] md:p-10">
              <p className="max-w-md text-sm leading-6 text-white/70 md:text-[0.9375rem]">
                Street, thread and ledger in one workspace — without another
                spreadsheet.
              </p>

              <div className="grid gap-6 lg:grid-cols-[1fr_minmax(18rem,22rem)] lg:items-end">
                <ul className="grid gap-4 sm:grid-cols-2">
                  {claims.map((c) => (
                    <li
                      key={c.title}
                      className="mkt-inset rounded-2xl p-4 backdrop-blur-md"
                    >
                      <h3 className="text-[0.9375rem] font-medium text-white">
                        {c.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {c.copy}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mkt-float lg:justify-self-end">
                  <ProductFrame
                    title="woosh.app / campaigns"
                    className="mkt-lift"
                  >
                    <WorkspaceMock />
                  </ProductFrame>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
