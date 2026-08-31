import type { BotTemplate, Vote } from "@/lib/types";

export const SEED_TEMPLATES: BotTemplate[] = [
  {
    id: "seed-jarvis",
    slug: "jarvis-n92u9t",
    botId: "N92u9t1nHlL_gtgk2nAeN",
    botUrl: "https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN",
    title: "Jarvis",
    authorName: "Andrew",
    summary:
      "A chief of agents for a solo founder. Routes work to specialist bots, keeps house rules, and only interrupts for judgment, money, publishing, or a blocked teammate.",
    description:
      "A chief of agents for a solo founder. Routes work to specialist bots, keeps house rules, and only interrupts for judgment, money, publishing, or a blocked teammate.",
    ogImage:
      "https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN/opengraph-image-bntnog",
    category: "Founder",
    tags: ["chief-of-staff", "routing", "solo-founder"],
    note: "The share-link pattern this gallery is built around: open on x.ai, then Add to Grok Bot.",
    submittedBy: "Grokdex staff",
    origin: "curated",
    featured: true,
    createdAt: "2026-08-20T12:00:00.000Z",
    adds: 0,
  },
];

export const SEED_VOTES: Vote[] = [
  { voterId: "seed-voter-01", templateId: "seed-jarvis", value: 1 },
  { voterId: "seed-voter-02", templateId: "seed-jarvis", value: 1 },
  { voterId: "seed-voter-03", templateId: "seed-jarvis", value: 1 },
  { voterId: "seed-voter-04", templateId: "seed-jarvis", value: 1 },
  { voterId: "seed-voter-05", templateId: "seed-jarvis", value: 1 },
  { voterId: "seed-voter-06", templateId: "seed-jarvis", value: 1 },
  { voterId: "seed-voter-07", templateId: "seed-jarvis", value: 1 },
  { voterId: "seed-voter-08", templateId: "seed-jarvis", value: 1 },
  { voterId: "seed-voter-09", templateId: "seed-jarvis", value: 1 },
  { voterId: "seed-voter-10", templateId: "seed-jarvis", value: 1 },
  { voterId: "seed-voter-11", templateId: "seed-jarvis", value: 1 },
  { voterId: "seed-voter-12", templateId: "seed-jarvis", value: -1 },
];
