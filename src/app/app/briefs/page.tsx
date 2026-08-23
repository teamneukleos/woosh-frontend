import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { listBriefsForBrand } from "@/domains/marketplace/briefs";
import { EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

function statusTone(status: string) {
  if (status === "OPEN") return "teal" as const;
  if (status === "DRAFT" || status === "PENDING_MODERATION")
    return "warn" as const;
  return "muted" as const;
}

export default async function BriefsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx || ctx.kind === "creator") redirect("/app");
  if (!ctx.activeBrandId) redirect("/app/onboarding");

  const briefs = await listBriefsForBrand(ctx.activeBrandId);

  return (
    <AppPage
        eyebrow="Demand"
        title="Briefs"
        description={`Campaigns for ${ctx.activeBrand?.name}.`}
        actions={
          <ButtonLink href="/app/briefs/new">New brief</ButtonLink>
        }
    >
      {briefs.length ? (
        <Table>
          <THead>
            <TR>
              <TH>Title</TH>
              <TH>Status</TH>
              <TH>Applications</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {briefs.map((b) => (
              <TR key={b.id}>
                <TD className="font-semibold">{b.title}</TD>
                <TD>
                  <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                </TD>
                <TD>{b._count.applications}</TD>
                <TD>
                  <Link
                    href={`/app/briefs/${b.id}`}
                    className="font-semibold text-[var(--woosh-blue)]"
                  >
                    Open
                  </Link>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      ) : (
        <EmptyState
          title="No briefs yet"
          description="Create your first brief to open applications."
          action={<ButtonLink href="/app/briefs/new">New brief</ButtonLink>}
        />
      )}
    </AppPage>
  );
}
