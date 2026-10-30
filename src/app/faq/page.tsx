import type { Metadata } from "next";
import { NoticeBoard } from "@/components/faq/NoticeBoard";
import { faqs } from "@/lib/data";
import { whatsappHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about vaccinations, meeting puppies, importing from Korea, delivery and aftercare.",
};

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div data-page="faq" className="tp-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <section
        data-pup-scene="true"
        data-tone="dark"
        className="tp-scene tp-faqroom overflow-hidden"
        style={{ "--sky-top": "#a95e32", "--sky-bottom": "#331c11" } as React.CSSProperties}
        aria-labelledby="faq-title"
      >
        <div className="gutter relative mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <header className="max-w-4xl">
            <h1 id="faq-title" className="font-plush text-giant">
              Questions &amp; answers
            </h1>
            <p className="text-lede mt-6 max-w-[52ch] text-[var(--ink-soft)]">
              Can&apos;t find what you&apos;re looking for? Message us on WhatsApp — our team is available 24/7.
            </p>
          </header>
          <div className="mt-12 md:mt-16">
            <NoticeBoard faqs={faqs} askHref={whatsappHref("Hi TeddyPups! I have a question:")} />
          </div>
        </div>
      </section>
    </div>
  );
}
