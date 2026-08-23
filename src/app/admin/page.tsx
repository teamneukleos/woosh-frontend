import { redirect } from "next/navigation";

/** Legacy path — ops lives in the app shell at /app/admin */
export default function AdminRedirect() {
  redirect("/app/admin");
}
