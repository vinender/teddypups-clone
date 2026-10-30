import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SketchbookUnderline } from "@/components/art/puppies";
import { PuppyBrowser } from "@/components/puppies/PuppyBrowser";
import { SketchCard } from "@/components/puppies/SketchCard";
import { Teddy } from "@/components/teddy/Teddy";
import { filterBreeds, puppies, rehomed } from "@/lib/data";

export const metadata: Metadata = {
  title: "Available puppies",
  description:
    "Teacup and designer puppies available now in Dubai or imported for you, with real photos of every puppy.",
};

const available = puppies.filter((p) => p.status === "available");

export default function PuppiesPage() {
  return (
    <div data-page="pups" className="tp-page">
      <section aria-labelledby="pups-title" className="tp-sketchbook">
        <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <div className="tp-sketchbook__head">
            <div className="tp-sketchbook__words">
              <p className="font-scrawl text-lg text-toffee-ink" data-reveal="true">
                from Teddy&apos;s sketchbook
              </p>
              <h1 id="pups-title" className="font-plush text-giant tp-sketchbook__title" data-reveal="true">
                Available puppies
                <SketchbookUnderline />
              </h1>
              <p className="tp-sketchbook__lede text-lede mt-6 max-w-[46ch] text-cocoa-soft" data-reveal="true">
                Every listing shows real photos of the actual puppy. Open a profile to see them all, then ask us about
                them on WhatsApp.
              </p>
            </div>
            <div className="tp-sketchbook__self" data-reveal="true">
              <Teddy pose="stand" facing="left" label="Teddy, the TeddyPups puppy" />
              <span className="font-scrawl tp-sketchbook__caption">self-portrait</span>
            </div>
          </div>
          <div className="mt-12">
            {/* The filter bar reads the URL on the client; until then show the full, unfiltered list. */}
            <Suspense
              fallback={
                <ul className="tp-sketches mt-20">
                  {available.map((p, i) => (
                    <li key={p.slug}>
                      <SketchCard pup={p} index={i} priority={i < 3} />
                    </li>
                  ))}
                </ul>
              }
            >
              <PuppyBrowser puppies={available} breeds={filterBreeds} />
            </Suspense>
          </div>
        </div>
      </section>

      <section aria-labelledby="gone-title" className="tp-gone-strip">
        <div className="gutter mx-auto flex max-w-[110rem] flex-col gap-10 md:flex-row md:items-center">
          <div className="md:w-1/3" data-reveal="true">
            <h2 id="gone-title" className="font-plush text-big">
              Already gone home
            </h2>
            <p className="mt-3 text-cocoa-soft">These puppies have found their families.</p>
            <Link className="btn btn-primary mt-6" href="/gone-home">
              See the puppies who&apos;ve gone home
            </Link>
          </div>
          <ul className="tp-gone-strip__row" aria-label="Some puppies who have gone home">
            {rehomed.slice(0, 5).map((p, i) => (
              <li key={p.slug}>
                <SketchCard pup={p} index={i} small />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
