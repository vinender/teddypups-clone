import type { Metadata } from "next";
import { Paw } from "@/components/art/chrome";
import { MemoriesHeart } from "@/components/art/families";
import { FamilyWall } from "@/components/home/FamilyWall";
import { Polaroid } from "@/components/media/Polaroid";
import { Teddy } from "@/components/teddy/Teddy";
import { familyPhotos } from "@/lib/data";

export const metadata: Metadata = {
  title: "Happy families",
  description: "Beautiful moments shared by TeddyPups families after welcoming their new puppy home.",
};

export default function HappyFamiliesPage() {
  return (
    <div data-page="families" className="tp-page">
      <section aria-labelledby="families-title" className="tp-memories">
        <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <div className="tp-memories__head">
            <div>
              <p className="font-scrawl text-lg text-toffee-ink" data-reveal="true">
                our wall of happy endings
              </p>
              <h1 id="families-title" className="font-plush text-giant tp-memories__title" data-reveal="true">
                Happy families
                <MemoriesHeart />
              </h1>
              <p className="text-lede mt-6 max-w-[50ch] text-cocoa-soft" data-reveal="true">
                Nothing makes us happier than seeing our puppies in loving homes! Here are some beautiful moments shared
                by our amazing clients after welcoming their furry friends.
              </p>
              <p className="font-scrawl mt-5 text-lg text-toffee-ink" data-reveal="true">
                {familyPhotos.length} moments and counting
              </p>
            </div>
            <figure className="tp-memories__note" data-reveal="true">
              <span
                aria-hidden="true"
                className="tp-tape tp-tape--center"
                style={{ "--tape": "#cfe5f6" } as React.CSSProperties}
              />
              <blockquote className="font-plush-text">
                “TeddyPups truly made our dream a reality. They supported us at every step of the import journey. Our
                Maltipoo arrived healthy, cheerful, and absolutely perfect. Having 24/7 support throughout the process
                gave us complete peace of mind.”
              </blockquote>
              <figcaption className="font-scrawl">Sarah M., Dubai, UAE</figcaption>
            </figure>
          </div>

          <FamilyWall photos={familyPhotos} className="mt-16 md:mt-20">
            <ul className="tp-wall" aria-label="Photos from TeddyPups families">
              {familyPhotos.map((m, i) => (
                <li
                  key={m.id}
                  className="tp-wall__item"
                  data-reveal="true"
                  style={{ "--d": `${(i % 4) * 60}ms` } as React.CSSProperties}
                >
                  <button
                    type="button"
                    className="tp-wall__print"
                    data-open-photo={i}
                    aria-label={`Open photo ${i + 1} of ${familyPhotos.length}${m.caption ? `: ${m.caption}` : ""}`}
                  >
                    <Polaroid
                      media={m}
                      index={i}
                      natural
                      priority={i < 4}
                      sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
                    />
                    <Paw className="tp-wall__paw" />
                  </button>
                </li>
              ))}
            </ul>
          </FamilyWall>

          <div className="tp-memories__foot">
            <Teddy pose="admiring" facing="left" className="w-36 md:w-44" label="Teddy, admiring the wall" />
            <p className="font-scrawl text-lg text-cocoa-soft">every one of them was a Teddy Pup once</p>
          </div>
        </div>
      </section>
    </div>
  );
}
