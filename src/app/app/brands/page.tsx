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
  if (!ctx || (ctx.kind !== "agency" && ctx.kind !== "admin")) {
    redirect("/app");
  }

  return (
    <AppPage
        eyebrow="Agency"
        title="Brands"
        description="Client brand workspaces. Switch context or add brands from settings."
        actions={
          <ButtonLink href="/app/settings" variant="secondary">
            Add brand
          </ButtonLink>
        }
    >
      {ctx.brands.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {ctx.brands.map((b) => (
            <li key={b.id}>
              <Panel>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--woosh-navy)]">
                    {b.name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--woosh-dull)]/65">
                    {b.industry || "No industry set"}
                  </p>
                </div>
                {ctx.activeBrandId === b.id ? (
                  <Badge tone="teal">Active</Badge>
                ) : null}
              </div>
              <div className="mt-4 flex gap-2">
                <ActionForm action={switchBrandAction} successTitle="Brand switched">
                  <input type="hidden" name="brandId" value={b.id} />
                  <Button type="submit" size="sm">
                    Switch to brand
                  </Button>
                </ActionForm>
                <ButtonLink href="/app/briefs" variant="secondary" size="sm">
                  Briefs
                </ButtonLink>
              </div>
              </Panel>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No client brands"
          description="Create your first brand to open discovery and briefs."
          action={
            <ButtonLink href="/app/onboarding">Create brand</ButtonLink>
          }
        />
      )}
    </AppPage>
  );
}
