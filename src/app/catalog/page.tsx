import type { Metadata } from "next";
import Link from "next/link";
import { CatalogParade } from "@/components/catalog-parade";
import { JsonLd } from "@/components/json-ld";
import { LockTitle } from "@/components/lock-title";
import { isFoundingBoard } from "@/lib/founding";
import { itemListJson } from "@/lib/json-ld";
import {
  catalogLaneTokens,
  groupTemplatesByCategory,
} from "@/lib/templates";
import { listTemplates } from "@/lib/templates-store";
import { motionDelay } from "@/lib/utils";
import { readVoterId } from "@/lib/voter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Public Grok Bots grouped by job. Hover a lane to pause, then open a bot to add a copy on x.ai.",
  alternates: { canonical: "/catalog" },
};

export default async function CatalogPage() {
  const templates = await listTemplates(await readVoterId());
  const founding = isFoundingBoard(templates.length);
  const lanes = groupTemplatesByCategory(templates).map((lane) => ({
    category: lane.category,
    tokens: catalogLaneTokens(lane),
  }));

  return (
    <main>
      <JsonLd data={itemListJson(templates, "/catalog")} />
      <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-8 sm:px-6 sm:pt-20">
        <LockTitle delay={0}>Catalog</LockTitle>
        <p
          className="motion-enter mt-4 max-w-2xl leading-7 text-body"
          style={motionDelay(1)}
        >
          {founding
            ? "Just opened. Every job is a moving lane. Listed bots march; open jobs wait for the first share link."
            : "Every public Grok Bot, grouped by job. Hover a lane to pause. Open a bot to add a copy on x.ai."}{" "}
          <Link
            href="/templates"
            className="text-foreground hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
          >
            Ranked board
          </Link>
          <span aria-hidden="true"> →</span>
        </p>
      </div>
      <CatalogParade lanes={lanes} />
    </main>
  );
}
