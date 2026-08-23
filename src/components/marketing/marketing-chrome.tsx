import { BrandFooter } from "@/components/marketing/brand-footer";
import { BrandNav } from "@/components/marketing/brand-nav";
import { Surface } from "@/components/surface";

export function MarketingChrome({ children }: { children: React.ReactNode }) {
  return (
    <Surface name="marketing">
      <div className="min-h-screen bg-mkt-bg text-mkt-fg">
        <BrandNav />
        <main className="pt-[calc(5.5rem+env(safe-area-inset-top))]">{children}</main>
        <BrandFooter />
      </div>
    </Surface>
  );
}
