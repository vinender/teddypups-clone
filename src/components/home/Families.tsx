import Link from "next/link";
import { POLAROID_DELAYS, Polaroid } from "@/components/media/Polaroid";
import { PupStop } from "@/components/teddy/Teddy";
import { homeFamilyPhotos as photos } from "@/lib/data";
import { FamilyWall } from "./FamilyWall";

const ON_WALL = 8;

export function Families() {
  return (
    <div data-section="families">
      <section
        data-pup-scene="true"
        data-tone="dark"
        className="tp-scene tp-dusk"
        aria-labelledby="dusk-title"
        style={{ "--sky-top": "#a65a30", "--sky-bottom": "#4d2b19" } as React.CSSProperties}
      >
        <div className="tp-dusk__sky gutter">
          <div className="tp-dusk__head">
            <h2 id="dusk-title" className="font-plush text-huge">
              Happy families &amp; puppies
            </h2>
            <p className="text-lede mt-5 max-w-[50ch] text-[var(--ink-soft)]">
              We are truly honored to see our puppies become cherished members of loving families. These heartwarming
              moments have been shared by our valued clients who welcomed a Teddy Pup into their homes and hearts.
            </p>
          </div>
          <figure className="tp-dusk__note">
            <blockquote className="font-plush-text">
              “TeddyPups truly made our dream a reality. They supported us at every step of the import journey. Our
              Maltipoo arrived healthy, cheerful, and absolutely perfect. Having 24/7 support throughout the process
              gave us complete peace of mind.”
            </blockquote>
            <figcaption className="font-scrawl">Sarah M., Dubai, UAE</figcaption>
          </figure>
        </div>

        <FamilyWall photos={photos}>
          <div className="tp-photowall__wall">
            <ul className="tp-photowall__prints" aria-label="Photos from TeddyPups families">
              {photos.slice(0, ON_WALL).map((m, i) => (
                <li
                  key={m.id}
                  data-reveal="true"
                  data-pup-look={i === 1 || i === 4 ? "" : undefined}
                  style={{ "--d": `${POLAROID_DELAYS[i]}ms` } as React.CSSProperties}
                >
                  <button
                    type="button"
                    className="tp-photowall__print"
                    data-open-photo={i}
                    aria-label={`Open photo ${i + 1} of ${photos.length}: ${m.caption}`}
                  >
                    <Polaroid media={m} index={i} sizes="(min-width: 1024px) 18rem, 45vw" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="tp-facade__ground">
              <span aria-hidden="true" className="tp-facade__door" />
              <span aria-hidden="true" className="tp-lamp">
                <span className="tp-lamp__light" />
              </span>
              <Link className="btn btn-primary tp-facade__cta" href="/happy-families">
                See every happy family
              </Link>
              <PupStop pose="sit" className="tp-dusk__teddy" />
            </div>
          </div>
          <div aria-hidden="true" className="tp-street__pavement" />
        </FamilyWall>
      </section>
    </div>
  );
}
