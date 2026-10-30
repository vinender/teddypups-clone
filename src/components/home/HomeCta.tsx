import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { PupStop } from "@/components/teddy/Teddy";
import { puppies } from "@/lib/data";
import { whatsappHref } from "@/lib/site";

export function HomeCta() {
  const waiting = puppies[0];
  return (
    <div data-section="cta">
      <section
        data-pup-scene="true"
        data-tone="dark"
        className="tp-scene tp-home"
        aria-labelledby="cta-title"
        style={{ "--sky-top": "#2f1a10", "--sky-bottom": "#24130b" } as React.CSSProperties}
      >
        <div className="tp-home__copy gutter">
          <h2 id="cta-title" className="font-plush text-huge">
            Ready to meet your new best friend?
          </h2>
          <p className="tp-home__lede">
            Bring home a healthy, happy teacup or designer puppy with expert guidance every step of the way. We help you
            find the right match and ensure a smooth, safe delivery across the UAE.
          </p>
        </div>
        <div className="tp-house">
          <span aria-hidden="true" className="tp-house__plant tp-house__plant--left" />
          <span aria-hidden="true" className="tp-house__lamp" />
          <div className="tp-house__doorway">
            <span className="tp-house__inside">
              <Photo media={waiting.cover} alt={`${waiting.displayName}, waiting inside`} sizes="16rem" />
            </span>
            <span aria-hidden="true" className="tp-house__door">
              <span className="tp-house__peep" />
              <span className="tp-house__knob" />
            </span>
          </div>
          <span aria-hidden="true" className="tp-house__plant tp-house__plant--right" />
          <span aria-hidden="true" className="tp-house__mat font-scrawl">
            welcome home
          </span>
          <PupStop pose="bow" className="tp-house__teddy" />
        </div>
        <div className="tp-home__actions gutter">
          <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
            Enquire on WhatsApp
          </a>
          <Link className="btn btn-ghost tp-home__ghost" href="/contact">
            Visit &amp; contact
          </Link>
        </div>
      </section>
    </div>
  );
}
