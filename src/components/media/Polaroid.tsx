import Image from "next/image";
import type { Media } from "@/lib/data";
import { Photo } from "./Photo";

/** Repeating hand-placed look: tilt, tape colour and where the tape sits. */
const LOOKS = [
  { tilt: "-2.2deg", tape: "#f6d79a", tapes: ["center"] },
  { tilt: "1.6deg", tape: "#f9cdbf", tapes: ["left"] },
  { tilt: "-0.9deg", tape: "#cfe5f6", tapes: ["right"] },
  { tilt: "2.4deg", tape: "#f6d79a", tapes: ["tl", "tr"] },
  { tilt: "-1.5deg", tape: "#e9dcc4", tapes: ["center"] },
  { tilt: "0.8deg", tape: "#f6d79a", tapes: ["right"] },
  { tilt: "-2.6deg", tape: "#f9cdbf", tapes: ["left"] },
  { tilt: "1.2deg", tape: "#cfe5f6", tapes: ["center"] },
];

const ALT = "A happy TeddyPups family with their new puppy";

/** Reveal order across a row of eight, so prints don't land left-to-right. */
export const POLAROID_DELAYS = [330, 0, 550, 110, 660, 220, 770, 440];

/** `natural` keeps the photo's own aspect ratio (the masonry wall) instead of a square crop. */
export function Polaroid({
  media,
  index,
  sizes,
  natural = false,
  priority = false,
}: {
  media: Media;
  index: number;
  sizes: string;
  natural?: boolean;
  priority?: boolean;
}) {
  const look = LOOKS[index % LOOKS.length];
  return (
    <span
      className="tp-polaroid"
      style={{ "--tilt": look.tilt, "--tape": look.tape, "--i": String(index) } as React.CSSProperties}
    >
      {look.tapes.map((t) => (
        <span key={t} aria-hidden="true" className={`tp-tape tp-tape--${t}`} />
      ))}
      <span className="tp-polaroid__photo">
        {natural ? (
          <Image
            src={media.url}
            alt={ALT}
            width={media.width}
            height={media.height}
            sizes={sizes}
            priority={priority}
            placeholder={media.blurDataUrl ? "blur" : "empty"}
            blurDataURL={media.blurDataUrl ?? undefined}
            style={{ width: "100%", height: "auto", backgroundColor: media.color }}
          />
        ) : (
          <Photo media={media} alt={ALT} sizes={sizes} priority={priority} />
        )}
      </span>
      <span className="tp-polaroid__caption font-scrawl">{media.caption}</span>
    </span>
  );
}
