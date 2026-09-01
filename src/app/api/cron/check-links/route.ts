import { cronAuthorized } from "@/lib/cron-auth";
import { refreshDueListings } from "@/lib/check-links";
import { expireFeatured } from "@/lib/templates-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await cronAuthorized(request))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  await expireFeatured();
  const result = await refreshDueListings();
  return Response.json(result);
}
