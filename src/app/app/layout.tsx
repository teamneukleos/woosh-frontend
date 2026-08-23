import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { AppShell } from "@/components/layout/app-shell";
import { Surface } from "@/components/surface";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  robots: noIndex,
  title: { absolute: "Workspace · Woosh" },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx) redirect("/login");

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <Surface name="app">
      <AppShell
        kind={ctx.kind}
        userName={session.user.name}
        userEmail={session.user.email}
        brands={ctx.brands.map((b) => ({ id: b.id, name: b.name }))}
        activeBrandId={ctx.activeBrandId}
        activeBrandName={ctx.activeBrand?.name}
        signOutAction={signOutAction}
      >
        {children}
      </AppShell>
    </Surface>
  );
}
