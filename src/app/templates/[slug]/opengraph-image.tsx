import { ImageResponse } from "next/og";
import { getTemplate } from "@/lib/templates-store";

export const alt = "Grokdex listing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = await getTemplate(slug);
  const title = template?.title ?? "Grok Bot";
  const summary =
    template?.summary ?? "A public Grok Bot share link on Grokdex.";
  const meta = template
    ? `${template.category}  ·  ${template.authorName}${
        template.xHandle ? `  ·  @${template.xHandle}` : ""
      }`
    : "Ranked Grok Bot catalog";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#ffffff",
          padding: "64px 72px",
          border: "1px solid #212327",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#7d8187",
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              transform: "rotate(45deg)",
              border: "2px solid #ffffff",
            }}
          />
          Grokdex
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: title.length > 42 ? 52 : 64,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#ff7a17",
              fontFamily: "monospace",
            }}
          >
            {meta}
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.35,
              color: "#dadbdf",
              maxWidth: 920,
            }}
          >
            {summary.length > 160 ? `${summary.slice(0, 157)}…` : summary}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#7d8187",
            fontFamily: "monospace",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          <span>Ranked Grok Bot</span>
          <span>grokdex.net</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
