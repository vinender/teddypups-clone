import Image from "next/image";
import Link from "next/link";
import { WaySkyline } from "@/components/art/home";
import { Flight } from "@/components/media/Flight";
import { PupStop } from "@/components/teddy/Teddy";
import { puppies } from "@/lib/data";
import { showroomPhotos } from "@/lib/showroom";

export function Paths() {
  const shot = showroomPhotos[0];
  // The Korean Teacup Maltipoo waves from the porthole.
  const flyer = puppies.find((p) => p.slug === "korean-teacup-maltipoo-female") ?? puppies[0];
  return (
    <div data-section="paths">
      <section
        data-pup-scene="true"
        data-tone="light"
        className="tp-scene tp-paths"
        aria-labelledby="paths-title"
        style={{ "--sky-top": "#fbe3b4", "--sky-bottom": "#f7d18d" } as React.CSSProperties}
      >
        <div className="gutter mx-auto max-w-[110rem]">
          <h2 id="paths-title" className="tp-paths__title font-plush text-huge">
            Two ways to meet your puppy
          </h2>
          <div className="tp-fork">
            <div aria-hidden="true" className="tp-fork__post" />
            <article className="tp-way tp-way--left" aria-labelledby="way-local">
              <h3 id="way-local" className="tp-sign tp-sign--left font-plush">
                Puppies in Dubai
              </h3>
              <div className="tp-way__scene" data-pup-look="true">
                <WaySkyline />
                <figure className="tp-window">
                  <span className="tp-window__glass">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      fill
                      sizes="(min-width: 768px) 22rem, 70vw"
                      style={{ objectFit: "cover" }}
                    />
                  </span>
                  <figcaption className="font-scrawl">In our showroom</figcaption>
                </figure>
              </div>
              <p className="tp-way__text">
                See them, love them, take them home. Come meet our locally available puppies before you decide.
              </p>
              <Link className="btn btn-primary" href="/puppies?origin=local">
                Meet local puppies
              </Link>
            </article>
            <article className="tp-way tp-way--right" aria-labelledby="way-imported">
              <h3 id="way-imported" className="tp-sign tp-sign--right font-plush">
                Imported for you
              </h3>
              <div className="tp-way__scene" data-pup-look="true">
                <Flight
                  label={`A plane bringing a ${flyer.displayName} puppy from Korea to Dubai`}
                  photo={`/_next/image?url=${encodeURIComponent(flyer.cover.url)}&w=128&q=75`}
                />
              </div>
              <p className="tp-way__text">
                Exclusive Korean teacup puppies, delivered. Order from the world&apos;s most reputable breeders and let
                us handle the import.
              </p>
              <Link className="btn btn-primary" href="/puppies?origin=imported">
                See imported puppies
              </Link>
            </article>
            <PupStop pose="sit" className="tp-fork__teddy" />
          </div>
        </div>
      </section>
    </div>
  );
}
