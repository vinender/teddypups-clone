import Link from "next/link";
import { NoteSquiggle, QuiltEdge } from "@/components/art/home";
import { Photo } from "@/components/media/Photo";
import { PupStop } from "@/components/teddy/Teddy";
import { puppies } from "@/lib/data";
import { site, whatsappHref } from "@/lib/site";
import { HeroLineup } from "./HeroLineup";

/** Where each puppy sits along the quilt: x position, photo width, how far it peeks, tilt. */
const SEATS = [
  { x: "9%", w: "8.6rem", peek: 0.62, tilt: "-5deg" },
  { x: "22.5%", w: "10.4rem", peek: 0.8, tilt: "3deg" },
  { x: "35%", w: "9.2rem", peek: 0.7, tilt: "-2deg" },
  { x: "65%", w: "9.4rem", peek: 0.74, tilt: "3deg" },
  { x: "77.5%", w: "10.6rem", peek: 0.82, tilt: "-3deg" },
  { x: "91%", w: "8.4rem", peek: 0.6, tilt: "4deg" },
];

function seatStyle(i: number) {
  const s = SEATS[i];
  return {
    "--x": s.x,
    "--w": s.w,
    "--peek": String(s.peek),
    "--tilt": s.tilt,
    "--i": String(i),
  } as React.CSSProperties;
}

export function Hero() {
  const lineup = puppies.slice(0, SEATS.length);
  // The pup peeking from behind Teddy's wing of the quilt.
  const wings = puppies.find((p) => p.slug === "pomeranian-female") ?? puppies[SEATS.length];

  return (
    <div data-section="hero">
      <section
        data-pup-scene="true"
        data-tone="light"
        className="tp-scene tp-hero"
        aria-labelledby="hero-title"
        style={{ "--sky-top": "#fffdf8", "--sky-bottom": "#fff1d8", "--quilt": "#fff1d8" } as React.CSSProperties}
      >
        <span aria-hidden="true" className="tp-hero__sun" />
        <div className="tp-hero__copy gutter">
          <p className="tp-hero__note font-scrawl">
            {site.tagline}
            <NoteSquiggle />
          </p>
          <h1 id="hero-title" className="tp-hero__title font-plush">
            <span className="tp-hero__line">Premium teacup</span>
            <span className="tp-hero__line tp-hero__line--2">puppies in Dubai</span>
          </h1>
          <p className="tp-hero__lede">
            Meet your new best friend in our Dubai showroom, or order a rare miniature breed from trusted breeders
            worldwide.
          </p>
          <div className="tp-hero__actions">
            <Link className="btn btn-primary" href="/puppies">
              View available puppies
            </Link>
            <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Enquire on WhatsApp
            </a>
          </div>
        </div>

        <HeroLineup>
          <ul className="tp-lineup" aria-label="Some of the puppies in our showroom">
            {lineup.map((p, i) => (
              <li key={p.slug} className="tp-lineup__seat" style={seatStyle(i)}>
                <Link
                  className="tp-lineup__pup"
                  data-pup-friend="true"
                  aria-label={`Meet ${p.displayName}, ${p.breed}`}
                  href={`/puppies/${p.slug}`}
                >
                  <span className="tp-lineup__photo">
                    <Photo media={p.cover} sizes="(min-width: 768px) 11rem, 30vw" priority={i < 3} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <ul aria-hidden="true" className="tp-lineup tp-lineup--tags">
            {lineup.map((p, i) => (
              <li key={p.slug} className="tp-lineup__seat" style={seatStyle(i)}>
                <span className="tp-lineup__ghost">
                  <span className="tp-lineup__name font-scrawl">{p.displayName}</span>
                </span>
              </li>
            ))}
          </ul>
          <span aria-hidden="true" className="tp-lineup__wings" data-for={SEATS.length}>
            <Photo media={wings.cover} alt="" sizes="12rem" />
          </span>
          <PupStop
            pose="peek"
            act="peekaboo"
            behind
            lane
            className="tp-hero__teddy"
            label="Teddy, the TeddyPups puppy, peeking over the quilt"
          />
          <div aria-hidden="true" className="tp-quilt">
            <QuiltEdge />
          </div>
        </HeroLineup>
      </section>
    </div>
  );
}
