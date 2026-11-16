
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { switchBrandAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { ActionForm } from "@/components/ui/action-form";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export default async function BrandsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getWorkspaceContext(session.user.id);
  if (
    !ctx ||
    (ctx.kind !== "agency" && ctx.kind !== "admin" && ctx.kind !== "brand")
  ) {
    redirect("/app");
  }

  const isAgency = ctx.kind === "agency";

  return (
    <AppPage
      eyebrow={isAgency ? "Agency" : "Organisation"}
      title="Brands"
      description={
        isAgency
          ? "Client brand workspaces. Switch context or add brands from settings."
          : "Each brand line has its own wallet. Switch context or add another from settings."
      }
      width="wide"
      className="w-full max-w-none"
      actions={
        <ButtonLink href="/app/settings" variant="secondary">
          Add brand
        </ButtonLink>
      }
    >
      {ctx.brands.length ? (
        <section className="w-full overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
            <div>
              <p className="text-sm font-semibold text-[var(--woosh-navy)]">
                Your brands
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)] tabular-nums">
                {ctx.brands.length} {ctx.brands.length === 1 ? "brand" : "brands"}
              </p>
            </div>
          </div>

          <ul className="divide-y divide-[var(--woosh-border)]">
            {ctx.brands.map((b) => {
              const isActive = ctx.activeBrandId === b.id;

              return (
                <li
                  key={b.id}
                  className="flex min-w-0 flex-col gap-4 px-5 py-5 transition-colors hover:bg-[#faf9f7] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#f4f3f0] text-sm font-semibold text-[var(--woosh-navy)]">
                      {initials(b.name)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words text-[15px] font-semibold text-[var(--woosh-navy)]">
                          {b.name}
                        </p>
                        {isActive ? <Badge tone="teal">Active</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {b.industry || "No industry set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pl-4">
                    <ActionForm
                      action={switchBrandAction}
                      successTitle="Brand switched"
                    >
                      <input type="hidden" name="brandId" value={b.id} />
                      <Button type="submit" size="sm" disabled={isActive}>
                        Switch to brand
                      </Button>
                    </ActionForm>

                    <ButtonLink
                      href="/app/briefs"
                      variant="secondary"
                      size="sm"
                    >
                      Briefs
                    </ButtonLink>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--woosh-border)] bg-white px-5 py-12">
          <EmptyState
            title={isAgency ? "No client brands" : "No brands yet"}
            description="Create your first brand to open discovery and briefs."
            action={
              <ButtonLink href="/app/onboarding">Create brand</ButtonLink>
            }
          />
        </div>
      )}
    </AppPage>
  );
}
