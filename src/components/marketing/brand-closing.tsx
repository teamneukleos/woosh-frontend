import Link from "next/link";
import Image from "next/image";
import { marketingPhotos } from "@/components/marketing/cast";

export function BrandClosing() {
  return (
    <section className="border-t border-mkt-border">
      <div className="mx-auto grid max-w-6xl items-stretch md:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-16 md:px-8 md:py-24">
          <h2 className="font-display max-w-xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
            The street already moved. Your next brief should too.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-mkt-muted">
            Claimed creators. Money on the ledger. One thread. Paystack. We
            take 0%.
          </p>
          <Link href="/register" className="mkt-cta mkt-cta-primary mt-8 w-fit">
            Sign up
          </Link>
        </div>
        <div className="relative min-h-[22rem] md:min-h-[32rem]">
          <Image
            src={marketingPhotos.closing}
            alt="Creator painting in a bright studio between campaign work"
            fill
            quality={95}
            unoptimized
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-[center_38%]"
            style={{ objectFit: "cover", objectPosition: "center 38%" }}
          />
        </div>
      </div>
    </section>
  );
}
