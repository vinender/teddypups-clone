"use client";

import { useRef, useState } from "react";
import { PlayIcon } from "@/components/art/home";

/** Muted looping clip inside a chat bubble, with a tap-to-play button. */
export function ChatClip({ src, poster, label }: { src: string; poster: string; label: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  return (
    <div className="tp-clip" data-playing={playing || undefined}>
      <video
        ref={video}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={toggle}
      />
      <button
        type="button"
        className="tp-clip__play"
        aria-pressed={playing}
        aria-label={playing ? "Pause video" : "Play video"}
        onClick={toggle}
      >
        <PlayIcon />
      </button>
    </div>
  );
}
