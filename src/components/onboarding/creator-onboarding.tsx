import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Panel } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress";

export function CreatorOnboarding({
  displayName,
  percentage,
  status,
}: {
  displayName: string;
  percentage: number;
  status: string;
}) {
  const steps = [
    ["01", "Identity", "Add your profile photo, cover image and creator bio."],
    ["02", "Audience", "Set your location, categories and languages."],
    ["03", "Channels", "Connect Instagram, TikTok or YouTube for live metrics."],
    ["04", "Packages", "Publish clear pricing, turnaround and usage rights."],
    ["05", "Portfolio", "Add at least three strong photo or video samples."],
    ["06", "Review", "Preview the brand experience and submit for approval."],
  ];
  return (
    <div className="grid gap-6">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge tone={status === "PUBLISHED" ? "teal" : "blue"}>
              {status.replaceAll("_", " ")}
            </Badge>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[var(--woosh-navy)]">
              Welcome, {displayName}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Your profile is {percentage}% ready. Every step can be saved and
              completed later.
            </p>
          </div>
          <ButtonLink href="/app/profile">Build my profile</ButtonLink>
        </div>
        <ProgressBar value={percentage} className="mt-6 h-2" />
      </Panel>
      <ol className="grid gap-3 sm:grid-cols-2">
        {steps.map(([number, title, description]) => (
          <li
            key={number}
            className="rounded-[var(--radius-lg)] border border-[var(--woosh-border)] bg-white p-5"
          >
            <span className="text-xs font-semibold text-[var(--woosh-blue)]">
              {number}
            </span>
            <h3 className="mt-2 font-semibold text-[var(--woosh-navy)]">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--woosh-dull)]/65">
              {description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
