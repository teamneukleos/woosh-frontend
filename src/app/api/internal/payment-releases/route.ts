import { proxyCronJob } from "@/lib/nest-cron";

export async function POST(request: Request) {
  return proxyCronJob(request, "/internal/payment-releases");
}
