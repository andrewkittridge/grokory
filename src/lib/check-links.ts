import { revalidatePath } from "next/cache";
import { isGoneError } from "./bot-url";
import { fetchBotPreview } from "./fetch-bot";
import {
  applyListingCheck,
  listDueForCheck,
} from "./templates-store";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function refreshDueListings(limit = 15) {
  const due = await listDueForCheck(limit);
  const checked: {
    slug: string;
    live: boolean;
    gone?: boolean;
    error?: string;
  }[] = [];

  for (const template of due) {
    const now = new Date().toISOString();
    const result = await fetchBotPreview(template.botUrl, { skipCache: true });
    if (result.ok) {
      await applyListingCheck({
        id: template.id,
        live: true,
        lastCheckedAt: now,
        ogImage: result.preview.ogImage,
        skills: result.preview.skills,
        routines: result.preview.routines,
        title: result.preview.title,
        authorName: result.preview.authorName,
        description: result.preview.description,
        summary: result.preview.summary,
      });
      checked.push({ slug: template.slug, live: true });
    } else if (result.gone || isGoneError(result.error)) {
      await applyListingCheck({
        id: template.id,
        live: false,
        lastCheckedAt: now,
      });
      checked.push({ slug: template.slug, live: false, gone: true });
    } else {
      await applyListingCheck({
        id: template.id,
        live: template.live,
        lastCheckedAt: now,
      });
      checked.push({
        slug: template.slug,
        live: template.live,
        error: result.error,
      });
    }
    await wait(200);
  }

  if (checked.length > 0) {
    revalidatePath("/");
    revalidatePath("/templates");
    revalidatePath("/catalog");
    revalidatePath("/feed.xml");
    for (const item of checked) {
      revalidatePath(`/templates/${item.slug}`);
    }
  }

  return { checked: checked.length, listings: checked };
}
