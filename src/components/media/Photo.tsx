import Image from "next/image";
import type { Media } from "@/lib/data";

type PhotoProps = {
  media: Media;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  quality?: number;
  /** "eager" for photos lazy loading can't see: in sideways strips or behind clip-path reveals. */
  loading?: "eager" | "lazy";
};

/** A cover-cropped photo that honours the media's focal point and blur placeholder. */
export function Photo({ media, alt = media.alt, sizes, priority, className, quality, loading }: PhotoProps) {
  const pos = `${(media.focalX * 100).toFixed(1)}% ${(media.focalY * 100).toFixed(1)}%`;
  return (
    <Image
      src={media.url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      loading={priority ? undefined : loading}
      className={className}
      placeholder={media.blurDataUrl ? "blur" : "empty"}
      blurDataURL={media.blurDataUrl ?? undefined}
      style={{ objectFit: "cover", objectPosition: pos, backgroundColor: media.color }}
    />
  );
}
