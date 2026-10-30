import Link from "next/link";
import { QaStar } from "@/components/art/home";
import { NIGHT_STARS, Stars } from "@/components/layout/Stars";
import { PupStop } from "@/components/teddy/Teddy";
import { faqs } from "@/lib/data";

/** The three questions families ask first. */
const HOME_FAQ_IDS = 3;

export function Questions() {
  return (
    <div data-section="questions">
      <section
        data-pup-scene="true"
        data-tone="dark"
        className="tp-scene tp-night"
        aria-labelledby="questions-title"
        style={{ "--sky-top": "#4d2b19", "--sky-bottom": "#2f1a10" } as React.CSSProperties}
      >
        <Stars stars={NIGHT_STARS} scale={1.8} className="pointer-events-none tp-night__stars" />
        <div className="tp-night__grid gutter">
          <div className="tp-night__intro">
            <h2 id="questions-title" className="font-plush text-huge">
              Questions, answered
            </h2>
            <Link className="btn btn-ghost tp-night__cta" href="/faq">
              Read all questions
            </Link>
            <div className="tp-night__pup">
              <span aria-hidden="true" className="tp-night__wonder font-plush">
                ?
              </span>
              <PupStop pose="sit" act="tilt" className="tp-night__teddy" />
            </div>
          </div>
          <dl className="tp-night__list">
            {faqs.slice(0, HOME_FAQ_IDS).map((f, i) => (
              <div key={f.id} className="tp-qa" data-pup-look={i < 2 ? "" : undefined}>
                <dt className="font-plush tp-qa__q">
                  <QaStar />
                  {f.question}
                </dt>
                <dd className="tp-qa__a">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
