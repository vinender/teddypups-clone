import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Paw } from "@/components/art/chrome";
import { CheckBadge } from "@/components/art/puppy";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Photo } from "@/components/media/Photo";
import { Gallery } from "@/components/puppy/Gallery";
import { HomeTrail } from "@/components/puppy/HomeTrail";
import { ScrollRibbon } from "@/components/puppy/ScrollRibbon";
import { Teddy } from "@/components/teddy/Teddy";
import { allPuppies, getPuppy, type Puppy, puppies, rehomed, type Step } from "@/lib/data";
import { absoluteUrl, whatsappHref } from "@/lib/site";

const STATUS = { available: "Available", reserved: "Reserved", rehomed: "Gone home" } as const;

const INCLUDED = [
  "Vaccinated",
  "Dewormed",
  "Verified health certificate from licensed vets",
  "Thoroughly checked before joining your family",
];

const IMPORT_STEPS: Step[] = [
  { title: "Reserve your puppy", text: "Tell us which puppy has captured your heart." },
  {
    title: "Personalized consultation",
    text: "We finalize details with you and share updates on your puppy's journey.",
  },
  { title: "Import and arrival", text: "We manage health checks, travel arrangements, and documentation." },
  { title: "Welcome home", text: "We help your new puppy settle in and ensure a smooth transition into your home." },
];

// The reference currently lists no local puppies, so this wording is ours, not copied.
const LOCAL_STEPS: Step[] = [
  { title: "Visit the showroom", text: "Come and meet the puppy in Downtown Dubai and spend time bonding." },
  { title: "Health check together", text: "We walk you through the vet certificate, vaccinations and care routine." },
  { title: "Take them home", text: "Local puppies are ready to go home with you the same day." },
];

export function generateStaticParams() {
  return allPuppies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/puppies/[slug]">): Promise<Metadata> {
  const pup = getPuppy((await params).slug);
  if (!pup) return {};
  return {
    title: `${pup.displayName} — ${pup.genderLabel}, ${pup.age}`,
    description:
      pup.description ||
      `Meet ${pup.displayName}, a ${pup.breed} ${pup.genderLabel.toLowerCase()} looking for a family.`,
    openGraph: { images: [pup.cover.url] },
  };
}

/** Prev/next cycle within the same shelf: available pups, or ones who've gone home. */
function neighbours(pup: Puppy) {
  const list = pup.status === "rehomed" ? rehomed : puppies;
  const i = list.findIndex((p) => p.slug === pup.slug);
  return [list[(i - 1 + list.length) % list.length], list[(i + 1) % list.length]] as const;
}

export default async function PuppyPage({ params }: PageProps<"/puppies/[slug]">) {
  const pup = getPuppy((await params).slug);
  if (!pup) notFound();

  const [prev, next] = neighbours(pup);
  const url = absoluteUrl(`/puppies/${pup.slug}`);
  const gone = pup.status === "rehomed";
  const ask = whatsappHref(
    gone
      ? `Hi TeddyPups! I loved ${pup.displayName} (${url}). Do you have a puppy like them?`
      : `Hi TeddyPups! I'm interested in the ${pup.displayName} (${pup.genderLabel.toLowerCase()}): ${url}`,
  );
  const imported = pup.origin === "imported";
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Puppies", item: absoluteUrl("/puppies") },
      { "@type": "ListItem", position: 2, name: pup.displayName, item: url },
    ],
  };

  return (
    <div data-page="pup" className="tp-page">
      <article
        className="tp-storybook"
        style={{
          background: `linear-gradient(180deg, color-mix(in oklab, ${pup.cover.color} 24%, var(--color-milk)) 0, var(--color-milk) 85%)`,
        }}
      >
        <ScrollRibbon />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
        <div className="gutter mx-auto max-w-[110rem] pb-20 pt-8 md:pt-12">
          <nav aria-label="Breadcrumb" className="text-[0.95rem] font-semibold text-cocoa-soft">
            <Link className="link-ink" href="/puppies">
              Available puppies
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{pup.displayName}</span>
          </nav>
          <p className="tp-chapter">
            <span aria-hidden="true" className="tp-chapter__n font-plush">
              1
            </span>
            <span className="font-scrawl">hello, it&apos;s me</span>
          </p>

          <div className="mt-4 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-7">
              <Gallery name={pup.displayName} media={pup.media} />
            </div>
            <div className="min-w-0 lg:col-span-5">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+5.5rem)]">
                <div
                  className="tp-tag tp-board mt-16 !rounded-[2.2rem_2.2rem_2.2rem_0.6rem] !p-7 md:!p-9 lg:mt-20"
                  data-reveal="true"
                >
                  <span aria-hidden="true" className="tp-tag__ring" />
                  <Teddy
                    pose="tag"
                    className="absolute -top-[4.8rem] right-6 w-[9.5rem]"
                    label={`Teddy, peeking over ${pup.displayName}'s tag`}
                  />
                  {gone ? (
                    <span className="inline-grid place-items-center rounded-full border-[3px] border-current px-3 py-1 font-scrawl text-sm uppercase tracking-wide -rotate-6 text-toffee-deep">
                      Gone home ♥
                    </span>
                  ) : (
                    <span className="chip">
                      <Paw className="size-4 text-toffee" />
                      {STATUS[pup.status]}
                    </span>
                  )}
                  <h1 className="font-plush mt-4 text-[clamp(2.6rem,5vw,4.6rem)]">{pup.displayName}</h1>
                  {pup.name && <p className="mt-2 text-lg font-semibold text-cocoa-soft">{pup.breed}</p>}
                  <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4">
                    {[
                      ["Breed", pup.breed],
                      ["Boy or girl", pup.genderLabel],
                      ["Age", pup.age],
                      ["Colour", pup.colour],
                      ["Where", imported ? "Imported for you" : "In our Dubai showroom"],
                    ]
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k}>
                          <dt className="font-scrawl text-sm text-cocoa-soft">{k}</dt>
                          <dd className="mt-0.5 text-[1.05rem] font-semibold">{v}</dd>
                        </div>
                      ))}
                  </dl>
                  {pup.description && <p className="mt-6 whitespace-pre-line text-cocoa-soft">{pup.description}</p>}
                  <div className="mt-8 flex flex-col gap-3">
                    <a href={ask} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                      {gone ? "Ask about a puppy like this" : "Ask about this puppy on WhatsApp"}
                    </a>
                    <a href={`#enquire-${pup.slug}`} className="btn btn-ghost">
                      Send an enquiry
                    </a>
                  </div>
                </div>

                <div className="tp-paper mt-8 -rotate-1">
                  <p className="tp-chapter">
                    <span aria-hidden="true" className="tp-chapter__n font-plush">
                      2
                    </span>
                    <span className="font-scrawl">what comes with this {pup.displayName}</span>
                  </p>
                  <h2 className="font-plush mt-1 text-[1.9rem]">Every Teddy Pup comes</h2>
                  <ul className="mt-4 space-y-2.5">
                    {INCLUDED.map((item) => (
                      <li key={item} className="flex items-start gap-3 font-semibold">
                        <CheckBadge />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {!gone && (
            <section aria-labelledby={`home-steps-${pup.slug}`} className="mt-20">
              <p className="tp-chapter">
                <span aria-hidden="true" className="tp-chapter__n font-plush">
                  3
                </span>
                <span className="font-scrawl">the way home</span>
              </p>
              <h2 id={`home-steps-${pup.slug}`} className="font-plush text-big mt-3">
                {imported ? "Coming home from abroad" : "Coming home from our showroom"}
              </h2>
              <HomeTrail steps={imported ? IMPORT_STEPS : LOCAL_STEPS} />
            </section>
          )}

          <section
            id={`enquire-${pup.slug}`}
            aria-labelledby={`enquire-title-${pup.slug}`}
            className="tp-letter mt-20 grid gap-10 lg:grid-cols-12"
          >
            <span aria-hidden="true" className="tp-letter__stamp">
              <Paw className="size-9" />
            </span>
            <div className="lg:col-span-4">
              <p className="tp-chapter">
                <span aria-hidden="true" className="tp-chapter__n font-plush">
                  {gone ? 3 : 4}
                </span>
                <span className="font-scrawl">dear TeddyPups…</span>
              </p>
              <h2 id={`enquire-title-${pup.slug}`} className="font-plush text-big mt-2">
                {gone ? "Looking for a puppy like this?" : "Ask about this puppy"}
              </h2>
              <p className="mt-4 text-cocoa-soft">
                Leave your details and our team will get back to you promptly — or message us on WhatsApp for the
                quickest reply.
              </p>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <EnquiryForm
                puppy={pup.slug}
                defaultMessage={
                  gone
                    ? `Hi! I loved ${pup.displayName}. Do you have a puppy like them?`
                    : `Hi! I'd love to know more about ${pup.displayName}.`
                }
                whatsappHref={ask}
                success={{
                  heading: "Letter on its way!",
                  body: `Thanks for asking about ${pup.displayName}. Our team will get back to you shortly.`,
                }}
              />
            </div>
          </section>

          <nav aria-label="More puppies" className="mt-16 grid gap-4 sm:grid-cols-2">
            {(
              [
                ["Previous pup", prev],
                ["Next pup", next],
              ] as const
            ).map(([label, p]) => (
              <Link
                key={label}
                className="group flex items-center gap-5 rounded-[2rem] border-[3px] border-cocoa bg-milk p-4 transition-transform duration-500 hover:-rotate-1 sm:last:flex-row-reverse sm:last:text-right"
                href={`/puppies/${p.slug}`}
              >
                <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[999px_999px_0.6rem_0.6rem] border-[3px] border-cocoa bg-honey-soft">
                  <Photo media={p.cover} sizes="5rem" />
                </span>
                <span>
                  <span className="font-scrawl block text-sm text-cocoa-soft">{label}</span>
                  <span className="font-plush text-[1.6rem]">{p.displayName}</span>
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </article>
    </div>
  );
}
