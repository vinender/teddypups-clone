import Link from "next/link";
import { DoorPeephole } from "@/components/art/home";
import { Photo } from "@/components/media/Photo";
import { PupStop } from "@/components/teddy/Teddy";
import { hasVideo, puppies, puppyMeta } from "@/lib/data";
import { MeetPin } from "./MeetPin";

const DOOR_COLOURS = ["#a24a1a", "#5a3a28", "#d4893f", "#b8644a", "#7a4a2e"];

export function Meet() {
  return (
    <div data-section="meet">
      <section
        data-pup-scene="true"
        data-tone="light"
        className="tp-scene tp-meet"
        aria-labelledby="meet-title"
        style={{ "--sky-top": "#fff1d8", "--sky-bottom": "#fbe3b4" } as React.CSSProperties}
      >
        <MeetPin>
          <div className="tp-meet__stage">
            <header className="tp-meet__head gutter">
              <div>
                <h2 id="meet-title" className="font-plush text-huge">
                  Meet the pups
                </h2>
                <p className="text-lede mt-3 max-w-[44ch] text-[var(--ink-soft)]">
                  Real puppies, real photos, looking for their families right now.
                </p>
              </div>
              <Link className="btn btn-primary shrink-0" href="/puppies">
                See all available puppies
              </Link>
            </header>
            <div className="tp-meet__hall">
              <ol className="tp-meet__track" data-treadmill="true" aria-label="Puppies looking for a family">
                {puppies.map((p, i) => (
                  <li key={p.slug} className="tp-door" data-open="true">
                    <Link
                      className="tp-door__link"
                      href={`/puppies/${p.slug}`}
                      style={{ "--door": DOOR_COLOURS[i % DOOR_COLOURS.length] } as React.CSSProperties}
                    >
                      <span className="tp-door__plate">
                        <span className="font-plush tp-door__name">{p.displayName}</span>
                        <span className="tp-door__meta">
                          {puppyMeta(p)}
                          {hasVideo(p) && ", with video"}
                        </span>
                      </span>
                      <span className="tp-door__frame">
                        <span className="tp-door__room">
                          <Photo media={p.cover} sizes="(min-width: 768px) 16rem, 45vw" />
                        </span>
                        <span aria-hidden="true" className="tp-door__way">
                          <span className="tp-door__leaf">
                            <DoorPeephole />
                            <span className="tp-door__knob" />
                          </span>
                        </span>
                        <span className="tp-door__tag font-scrawl">Available</span>
                      </span>
                    </Link>
                  </li>
                ))}
                <li className="tp-door tp-door--all" data-open="true">
                  <Link className="tp-door__link" href="/puppies">
                    <span className="tp-door__frame tp-door__frame--all">
                      <span className="font-plush tp-door__all">Meet them all</span>
                    </span>
                  </Link>
                </li>
              </ol>
              <div aria-hidden="true" className="tp-meet__floor" />
              <PupStop pose="sit" className="tp-meet__teddy" />
            </div>
          </div>
        </MeetPin>
      </section>
    </div>
  );
}
