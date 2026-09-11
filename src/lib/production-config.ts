const PLACEHOLDER_MARKERS = [
  "replace-with",
  "changeme",
  "your-",
];

function missingOrPlaceholder(value?: string) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return (
    !normalized ||
    PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker))
  );
}

export function productionConfigurationIssues(
  env: Record<string, string | undefined>,
) {
  const issues: string[] = [];
  const requireValue = (name: string) => {
    if (missingOrPlaceholder(env[name])) issues.push(`${name} is required`);
  };

  [
    "AUTH_URL",
    "AUTH_SECRET",
    "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY",
    "NEXT_PUBLIC_APP_URL",
    "WOOSH_API_URL",
  ].forEach(requireValue);

  const appUrl = env.NEXT_PUBLIC_APP_URL?.trim();
  const authUrl = env.AUTH_URL?.trim();
  if (!appUrl) {
    issues.push("NEXT_PUBLIC_APP_URL is required");
  } else if (!appUrl.startsWith("https://")) {
    issues.push("NEXT_PUBLIC_APP_URL must use HTTPS");
  }
  if (authUrl && !authUrl.startsWith("https://")) {
    issues.push("AUTH_URL must use HTTPS");
  }
  if (
    appUrl &&
    authUrl &&
    appUrl.replace(/\/$/, "") !== authUrl.replace(/\/$/, "")
  ) {
    issues.push("AUTH_URL must match NEXT_PUBLIC_APP_URL");
  }

  const apiUrl = env.WOOSH_API_URL?.trim() || env.NEXT_PUBLIC_API_URL?.trim();
  if (apiUrl && !apiUrl.startsWith("https://") && appUrl?.startsWith("https://")) {
    issues.push("WOOSH_API_URL must use HTTPS in production");
  }

  if (env.WOOSH_ALLOW_DEV_OAUTH === "true") {
    issues.push("WOOSH_ALLOW_DEV_OAUTH must be false in production");
  }
  if ((env.AUTH_SECRET?.trim().length ?? 0) < 32) {
    issues.push("AUTH_SECRET must contain at least 32 characters");
  }
  if ((env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY?.trim().length ?? 0) < 32) {
    issues.push(
      "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY must contain at least 32 characters",
    );
  }

  return [...new Set(issues)];
}

export function assertProductionConfiguration(
  env: Record<string, string | undefined> = process.env,
) {
  const issues = productionConfigurationIssues(env);
  if (issues.length) {
    throw new Error(
      `Production configuration is incomplete:\n- ${issues.join("\n- ")}`,
    );
  }
}
