import { cronAuthorized } from "@/lib/cron-auth";
import { refreshDueListings } from "@/lib/check-links";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await cronAuthorized(request))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await refreshDueListings();
  return Response.json(result);
}
