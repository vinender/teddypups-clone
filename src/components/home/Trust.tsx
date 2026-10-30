import { HorizonCity, StampChat, StampGlobe, StampHeart, StampPlane } from "@/components/art/home";
import { PupStop } from "@/components/teddy/Teddy";

const ENTRIES = [
  {
    stamp: "round",
    Icon: StampHeart,
    title: "Vet-checked & healthy",
    text: "Every puppy comes vaccinated, dewormed, and with a verified health certificate.",
    ink: "#a24a1a",
    tilt: "-8deg",
  },
  {
    stamp: "ticket",
    Icon: StampPlane,
    title: "Korea to Dubai, safely",
    text: "Trusted breeders, safe travel, and premium care from start to finish.",
    ink: "#1f6b45",
    tilt: "5deg",
  },
  {
    stamp: "oval",
    Icon: StampChat,
    title: "Support 24/7",
    text: "Always here to help, from choosing your puppy to post-delivery support.",
    ink: "#5a3a28",
    tilt: "-4deg",
  },
  {
    stamp: "scallop",
    Icon: StampGlobe,
    title: "Trusted by families worldwide",
    text: "Puppies delivered to loving homes all around the world.",
    ink: "#c2622b",
    tilt: "7deg",
  },
];

export function Trust() {
  return (
    <div data-section="trust">
      <section
        data-pup-scene="true"
        data-tone="light"
        className="tp-scene tp-passport"
        aria-labelledby="trust-title"
        style={{ "--sky-top": "#f0b866", "--sky-bottom": "#a65a30" } as React.CSSProperties}
      >
        <div className="gutter mx-auto max-w-[96rem]">
          <div className="tp-book">
            <div className="tp-book__page tp-book__page--left">
              <p aria-hidden="true" className="tp-book__kicker font-scrawl">
                puppy passport
              </p>
              <h2 id="trust-title" className="font-plush tp-book__title">
                Why families trust TeddyPups
              </h2>
              <PupStop pose="sit" className="tp-book__teddy" />
            </div>
            <ul className="tp-book__page tp-book__page--right">
              {ENTRIES.map(({ stamp, Icon, title, text, ink, tilt }, i) => (
                <li
                  key={title}
                  className="tp-entry"
                  style={{ "--ink-stamp": ink, "--tilt": tilt, "--i": String(i) } as React.CSSProperties}
                >
                  <span className={`tp-stamp tp-stamp--${stamp}`}>
                    <Icon />
                    <span className="tp-stamp__title font-plush">{title}</span>
                  </span>
                  <p className="tp-entry__text">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div aria-hidden="true" className="tp-horizon">
          <span className="tp-horizon__sun" />
          <HorizonCity />
        </div>
      </section>
    </div>
  );
}
