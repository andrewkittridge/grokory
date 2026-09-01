import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { LegalDoc } from "@/components/legal-doc";
import { FAQS } from "@/lib/agent";
import { faqJson } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "What Grokdex is, how to list a public Grok Bot, and how Add copies a template onto your Grok account.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <LegalDoc kicker="FAQ" title="FAQ" updated="1 September 2026">
      <JsonLd data={faqJson()} />
      {FAQS.map((item) => (
        <section key={item.q}>
          <h2>{item.q}</h2>
          <p>{item.a}</p>
        </section>
      ))}
    </LegalDoc>
  );
}
