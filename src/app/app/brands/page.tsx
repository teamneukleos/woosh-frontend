import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { EmptyState, Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { switchBrandAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { ActionForm } from "@/components/ui/action-form";

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
      actions={
        <ButtonLink href="/app/settings" variant="secondary">
          Add brand
        </ButtonLink>
      }
    >
      {ctx.brands.length ? (
        <Panel className="overflow-hidden p-0">
          <div className="border-b border-[var(--woosh-navy)]/10 bg-[var(--woosh-navy)]/[0.03] px-5 py-2.5 text-xs font-medium text-[var(--woosh-dull)]/70">
            {ctx.brands.length} {ctx.brands.length === 1 ? "brand" : "brands"}
          </div>

          <ul className="divide-y divide-[var(--woosh-navy)]/10">
            {ctx.brands.map((b) => {
              const isActive = ctx.activeBrandId === b.id;
              return (
                <li
                  key={b.id}
                  className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
                    isActive ? "bg-[var(--woosh-navy)]/[0.04]" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--woosh-navy)] text-sm font-semibold text-white"
                    >
                      {b.name.trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-[var(--woosh-navy)]">
                          {b.name}
                        </p>
                        {isActive ? <Badge tone="teal">Active</Badge> : null}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-[var(--woosh-dull)]/65">
                        {b.industry || "No industry set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <ActionForm
                      action={switchBrandAction}
                      successTitle="Brand switched"
                    >
                      <input type="hidden" name="brandId" value={b.id} />
                      <Button type="submit" size="sm">
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
        </Panel>
      ) : (
        <EmptyState
          title={isAgency ? "No client brands" : "No brands yet"}
          description="Create your first brand to open discovery and briefs."
          action={<ButtonLink href="/app/onboarding">Create brand</ButtonLink>}
        />
      )}
    </AppPage>
  );
}