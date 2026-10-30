"use client";

import { useRef } from "react";
import { PhotoViewer, type PhotoViewerHandle } from "@/components/media/PhotoViewer";
import type { Media } from "@/lib/data";

/** Wraps a wall of polaroids; any `[data-open-photo]` button inside opens the viewer. */
export function FamilyWall({
  photos,
  className = "tp-photowall",
  children,
}: {
  photos: Media[];
  className?: string;
  children: React.ReactNode;
}) {
  const viewer = useRef<PhotoViewerHandle>(null);
  return (
    <div
      className={className}
      onClick={(e) => {
        const btn = (e.target as Element).closest<HTMLElement>("[data-open-photo]");
        if (btn) viewer.current?.open(Number(btn.dataset.openPhoto));
      }}
    >
      {children}
      <PhotoViewer ref={viewer} photos={photos} label="Photo viewer" />
    </div>
  );
}
