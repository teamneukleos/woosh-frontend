import { redirect } from "next/navigation";

export default async function YoutubeOAuthLanding({
  searchParams,
}: {
  searchParams: Promise<{ youtube?: string; message?: string }>;
}) {
  const params = await searchParams;
  if (params.youtube === "connected") {
    redirect("/app/profile?oauth=success");
  }
  const message = params.message
    ? `&oauthMessage=${encodeURIComponent(params.message)}`
    : "";
  redirect(`/app/profile?oauth=error${message}`);
}
