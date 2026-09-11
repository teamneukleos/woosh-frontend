import { redirect } from "next/navigation";

export default async function InstagramOAuthLanding({
  searchParams,
}: {
  searchParams: Promise<{ instagram?: string; message?: string }>;
}) {
  const params = await searchParams;
  if (params.instagram === "connected") {
    redirect("/app/profile?oauth=success");
  }
  const message = params.message
    ? `&oauthMessage=${encodeURIComponent(params.message)}`
    : "";
  redirect(`/app/profile?oauth=error${message}`);
}
