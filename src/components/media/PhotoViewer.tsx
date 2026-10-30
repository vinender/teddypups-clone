"use client";

import Image from "next/image";
import { type Ref, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Media } from "@/lib/data";

export type PhotoViewerHandle = { open: (index: number) => void };

/**
 * Full-screen photo/video viewer on a native <dialog>: Close, Previous/Next,
 * arrow keys and horizontal swipe. Wraps around at the ends.
 */
export function PhotoViewer({ photos, label, ref }: { photos: Media[]; label: string; ref: Ref<PhotoViewerHandle> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [at, setAt] = useState<number | null>(null);
  const swipe = useRef<number | null>(null);
  const n = photos.length;

  const go = useCallback((i: number) => setAt(((i % n) + n) % n), [n]);
  useImperativeHandle(ref, () => ({
    open: (i) => {
      go(i);
      dialog.current?.showModal();
    },
  }));

  useEffect(() => {
    if (at === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(at + 1);
      if (e.key === "ArrowLeft") go(at - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [at, go]);

  const m = at === null ? null : photos[at];
  return (
    <dialog
      ref={dialog}
      aria-label={label}
      onClose={() => setAt(null)}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      data-lenis-prevent="true"
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-cocoa/95 p-0 text-milk backdrop:bg-cocoa/70"
    >
      {m && at !== null && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="font-scrawl text-lg">
              {m.caption ? `${m.caption} · ` : ""}
              {at + 1} / {n}
            </p>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="h-11 rounded-full bg-milk px-5 font-semibold text-cocoa"
            >
              Close
            </button>
          </div>
          <div
            className="relative flex-1 touch-pan-y"
            onPointerDown={(e) => (swipe.current = e.clientX)}
            onPointerUp={(e) => {
              if (swipe.current === null) return;
              const dx = e.clientX - swipe.current;
              swipe.current = null;
              if (dx < -60) go(at + 1);
              else if (dx > 60) go(at - 1);
            }}
          >
            {m.kind === "video" ? (
              <video
                key={m.id}
                src={m.url}
                poster={m.poster?.url}
                controls
                autoPlay
                playsInline
                className="absolute inset-0 size-full object-contain"
              />
            ) : (
              <Image
                key={m.id}
                src={m.url}
                alt={m.alt}
                fill
                sizes="100vw"
                quality={85}
                placeholder={m.blurDataUrl ? "blur" : "empty"}
                blurDataURL={m.blurDataUrl ?? undefined}
                className="object-contain"
              />
            )}
          </div>
          {n > 1 && (
            <div className="flex justify-center gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
              <button
                type="button"
                onClick={() => go(at - 1)}
                className="h-12 rounded-full border-2 border-milk px-6 font-semibold"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => go(at + 1)}
                className="h-12 rounded-full bg-honey px-6 font-semibold text-cocoa"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
