import Image from "next/image";
import Link from "next/link";
import { ChatRoute, SendIcon } from "@/components/art/home";
import { PupStop } from "@/components/teddy/Teddy";
import { breeds, homeSteps } from "@/lib/data";
import { showroomPhotos, showroomVideo } from "@/lib/showroom";
import { site, whatsappHref } from "@/lib/site";
import { ChatClip } from "./ChatClip";
import { ChatPlayback } from "./ChatPlayback";

export function Journey() {
  return (
    <div data-section="journey">
      <section
        data-pup-scene="true"
        data-tone="light"
        className="tp-scene tp-chat"
        aria-labelledby="journey-title"
        style={{ "--sky-top": "#f7d18d", "--sky-bottom": "#f0b866" } as React.CSSProperties}
      >
        <ChatPlayback steps={homeSteps.length}>
          <div className="tp-chat__story">
            <h2 id="journey-title" className="font-plush text-huge">
              Your puppy journey
            </h2>
            <p className="text-lede mt-5 max-w-[42ch] text-[var(--ink-soft)]">
              A premium, step-by-step concierge experience. We make adoption simple, secure, and purely joyful.
            </p>
            <ol className="tp-chat__steps">
              {homeSteps.map((s, i) => (
                <li
                  key={s.title}
                  className="tp-chat__step"
                  data-done={i < homeSteps.length - 1 || undefined}
                  data-active={i === homeSteps.length - 1 || undefined}
                >
                  <span className="tp-chat__num font-plush" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="font-plush tp-chat__title">{s.title}</h3>
                  <p className="tp-chat__text">{s.text}</p>
                </li>
              ))}
            </ol>
            <Link className="btn btn-ghost tp-chat__cta" href="/how-it-works">
              How it works
            </Link>
          </div>

          <div className="tp-chat__side">
            <div className="tp-phone" aria-label={`A WhatsApp conversation with ${site.name}`} role="group">
              <div className="tp-phone__bar">
                <Image alt="" width={40} height={40} className="tp-phone__avatar" src="/brand/logo.png" />
                <span>
                  <span className="tp-phone__name">{site.name}</span>
                  <span className="tp-phone__status">online</span>
                </span>
              </div>
              <div className="tp-phone__screen">
                <p className="tp-msg tp-msg--me">Hi TeddyPups! I&apos;d love to know more about your puppies.</p>

                <div className="tp-msg-group" data-step="0" data-show="true">
                  <div className="tp-msg tp-msg--them">
                    <p>{homeSteps[0].text}</p>
                    <ul className="tp-chips" aria-label="Breeds we have now">
                      {breeds.map((b) => (
                        <li key={b.slug}>
                          <Link href={`/puppies?breed=${b.slug}`}>{b.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="tp-msg-group" data-step="1" data-show="true">
                  <div className="tp-msg tp-msg--them tp-msg--media">
                    <div className="tp-snaps">
                      {showroomPhotos.map((s) => (
                        <span key={s.src} className="tp-snaps__one">
                          <Image src={s.src} alt={s.alt} fill sizes="7rem" style={{ objectFit: "cover" }} />
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="tp-msg tp-msg--them tp-msg--media">
                    <ChatClip {...showroomVideo} />
                  </div>
                  <p className="tp-msg tp-msg--them">{homeSteps[1].text}</p>
                </div>

                <div className="tp-msg-group" data-step="2" data-show="true">
                  <div className="tp-msg tp-msg--them">
                    <p>{homeSteps[2].text}</p>
                    <ChatRoute />
                  </div>
                </div>

                <p className="tp-typing" data-show="false" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </p>
              </div>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="tp-phone__compose">
                <span>Say hello on WhatsApp</span>
                <SendIcon />
              </a>
            </div>
            <PupStop pose="sit" className="tp-chat__teddy" />
          </div>
        </ChatPlayback>
      </section>
    </div>
  );
}
