import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { LegalDoc } from "@/components/legal-doc";
import { FAQS } from "@/lib/agent";
import { GUIDES } from "@/lib/guides";
import { faqJson } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "What Grokdex is, how to list a public Grok Bot, and how Add copies a template onto your Grok account.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <LegalDoc title="FAQ" updated="1 September 2026">
      <JsonLd data={faqJson()} />
      {FAQS.map((item) => (
        <section key={item.q}>
          <h2>{item.q}</h2>
          <p>{item.a}</p>
        </section>
      ))}
      <section>
        <h2>Guides</h2>
        <ul>
          {GUIDES.map((guide) => (
            <li key={guide.slug}>
              <Link href={guide.path}>{guide.title}</Link>
            </li>
          ))}
        </ul>
      </section>
    </LegalDoc>
  );
}
