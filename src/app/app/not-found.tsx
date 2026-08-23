import { EmptyState } from "@/components/ui/panel";
import { ButtonLink } from "@/components/ui/button-link";
import { AppPage } from "@/components/ui/app-page";

export default function AppNotFound() {
  return (
    <AppPage
      eyebrow="Workspace"
      title="Page not found"
      description="This workspace link is missing or you don’t have access."
    >
      <EmptyState
        title="Nothing here"
        description="It may have been moved, or the URL is incomplete."
        action={<ButtonLink href="/app">Back to home</ButtonLink>}
      />
    </AppPage>
  );
}
