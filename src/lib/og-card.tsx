import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export type OgCardProps = {
  title: string;
  kicker?: string;
  summary?: string;
  footerLeft?: string;
  footerRight?: string;
  badge?: string;
};

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function ogListingCount(n: number) {
  return n === 1 ? "1 public bot" : `${n} public bots`;
}

export function ogHomeKicker(listed: number, founding: boolean) {
  if (founding) {
    return listed === 0
      ? "Just opened"
      : `${ogListingCount(listed)} · just opened`;
  }
  return ogListingCount(listed);
}

export function OgCard({
  title,
  kicker,
  summary,
  footerLeft = "Ranked Grok Bot",
  footerRight = "grokdex.net",
  badge,
}: OgCardProps) {
  const titleSize = title.length > 42 ? 48 : badge ? 56 : 64;

  return (
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
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            flexGrow: 1,
            flexShrink: 1,
            maxWidth: badge ? 820 : 980,
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            {title}
          </div>
          {kicker ? (
            <div
              style={{
                fontSize: 22,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#ff7a17",
                fontFamily: "monospace",
              }}
            >
              {kicker}
            </div>
          ) : null}
          {summary ? (
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.35,
                color: "#dadbdf",
              }}
            >
              {truncate(summary, 160)}
            </div>
          ) : null}
        </div>
        {badge ? (
          <div
            style={{
              display: "flex",
              fontSize: badge.length > 3 ? 44 : 92,
              lineHeight: 1,
              color: "#ff7a17",
              fontFamily: "monospace",
              letterSpacing: "0.08em",
              flexShrink: 0,
            }}
          >
            {badge}
          </div>
        ) : null}
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
        <span>{footerLeft}</span>
        <span>{footerRight}</span>
      </div>
    </div>
  );
}

export function ogImage(props: OgCardProps) {
  return new ImageResponse(<OgCard {...props} />, { ...OG_SIZE });
}
