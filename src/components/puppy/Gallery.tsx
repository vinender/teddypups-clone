"use client";

import { useRef, useState } from "react";
import { Photo } from "@/components/media/Photo";
import { PhotoViewer, type PhotoViewerHandle } from "@/components/media/PhotoViewer";
import type { Media } from "@/lib/data";

/** A frame to show for any media item: the image itself, or a video's poster. */
const still = (m: Media) => (m.kind === "video" && m.poster ? m.poster : m);

/** Story-page gallery: one big photo with prev/next, a thumbnail strip, and a full-screen viewer. */
export function Gallery({ name, media }: { name: string; media: Media[] }) {
  const [at, setAt] = useState(0);
  const viewer = useRef<PhotoViewerHandle>(null);
  const n = media.length;
  const go = (i: number) => setAt(((i % n) + n) % n);
  const kind = (m: Media) => (m.kind === "video" ? "video" : "photo");
  const current = media[at];

  return (
    <div>
      <div className="tp-storypage relative aspect-[4/5] md:aspect-[5/6]">
        <button
          type="button"
          className="absolute inset-0 block size-full"
          aria-label={`Open ${name}, ${kind(current)} ${at + 1} of ${n} full screen`}
          onClick={() => viewer.current?.open(at)}
        >
          <Photo
            key={current.id}
            media={still(current)}
            alt={current.alt}
            sizes="(min-width: 1024px) 55vw, 100vw"
            priority={at === 0}
          />
          {current.kind === "video" && (
            <span className="absolute inset-0 grid place-items-center text-5xl text-milk drop-shadow">▶</span>
          )}
        </button>
        {n > 1 && (
          <div className="absolute inset-x-4 bottom-4 flex justify-between">
            <button
              type="button"
              onClick={() => go(at - 1)}
              className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <span className="self-center rounded-full bg-cocoa/80 px-3 py-1 text-sm font-semibold text-milk">
              {at + 1} / {n}
            </span>
            <button
              type="button"
              onClick={() => go(at + 1)}
              className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold"
              aria-label="Next photo"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {n > 1 && (
        <ul
          className="mt-3 flex gap-3 overflow-x-auto px-1 pb-2 pt-2 [scrollbar-width:thin]"
          aria-label={`All photos of ${name}`}
        >
          {media.map((m, i) => (
            <li key={m.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setAt(i)}
                aria-label={`${name}, ${kind(m)} ${i + 1} of ${n}`}
                aria-current={i === at}
                className={`relative block h-24 w-20 overflow-hidden rounded-[0.9rem] border-[3px] transition-transform duration-300 md:h-28 md:w-24 ${
                  i === at
                    ? "-rotate-3 -translate-y-1 border-toffee-deep"
                    : "border-cocoa/30 hover:-rotate-2 hover:border-cocoa"
                }`}
              >
                <Photo media={still(m)} alt="" sizes="6rem" />
                {m.kind === "video" && (
                  <span className="absolute inset-0 grid place-items-center bg-cocoa/30 text-lg text-milk">▶</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <PhotoViewer ref={viewer} photos={media} label={`${name} photos`} />
    </div>
  );
}
