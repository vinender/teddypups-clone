import type { Metadata } from "next";
import Link from "next/link";
import { GoneHeart, TicketRoute } from "@/components/art/gone";
import { Photo } from "@/components/media/Photo";
import { Teddy } from "@/components/teddy/Teddy";
import { rehomed } from "@/lib/data";

export const metadata: Metadata = {
  title: "Gone home",
  description:
    "Puppies who have already joined loving families. Looking for one just like them? We'll help you find your match.",
};

const TILTS = [-1.4, 1.1, -0.6, 1.6, -1.1, 0.8];

export default function GoneHomePage() {
  return (
    <div data-page="gone" className="tp-page">
      <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
        <header className="tp-boothhead">
          <div className="max-w-3xl">
            <h1 className="font-plush text-giant">
              Gone home
              <GoneHeart />
            </h1>
            <p className="text-lede mt-6 text-cocoa-soft">
              Every puppy here has already joined a loving family. Looking for one just like them? Tell us — we&apos;ll
              help you find your match.
            </p>
            <Link className="btn btn-primary mt-8" href="/puppies">
              See available puppies
            </Link>
          </div>
          <div aria-hidden="true" className="tp-booth">
            <Teddy pose="portrait" className="tp-booth__teddy" />
            <div className="tp-booth__counter">
              <span className="font-plush">tickets home</span>
            </div>
          </div>
        </header>
        <div>
          <ul className="tp-tickets" aria-label="Puppies who have gone home">
            {rehomed.map((p, i) => {
              // Named pups lead with their name, so the meta line carries the breed.
              const meta = p.name ? `${p.breed}, ${p.genderLabel.toLowerCase()}` : p.genderLabel;
              return (
                <li
                  key={p.slug}
                  className="tp-ticket"
                  data-reveal="true"
                  style={{ "--tilt": `${TILTS[i % TILTS.length]}deg`, "--i": String(i) } as React.CSSProperties}
                >
                  <Link className="tp-ticket__link" href={`/puppies/${p.slug}`}>
                    <span className="tp-ticket__main">
                      <span className="tp-ticket__photo">
                        <Photo media={p.cover} sizes="(min-width: 768px) 12rem, 35vw" loading="eager" />
                      </span>
                      <span className="tp-ticket__body">
                        <span className="font-scrawl tp-ticket__kicker">one ticket home</span>
                        <span className="font-plush tp-ticket__name">{p.displayName}</span>
                        <span className="tp-ticket__meta">{meta}</span>
                        <span className="tp-ticket__route">
                          <span>{p.origin === "local" ? "Dubai showroom" : "TeddyPups"}</span>
                          <TicketRoute />
                          <span>home ♥</span>
                        </span>
                      </span>
                    </span>
                    <span aria-hidden="true" className="tp-ticket__stub">
                      <span className="font-plush">admit one</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
