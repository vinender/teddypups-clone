"use client";

import { useEffect, useRef } from "react";

const TYPE_MS = 900;
const READ_MS = 1300;

/**
 * Plays the WhatsApp conversation the first time the section comes into view:
 * Teddy's team "types", each reply group lands, and the matching journey step
 * on the left lights up. Server HTML shows the finished chat, so nothing is lost
 * without JS or with reduced motion.
 */
export function ChatPlayback({ steps, children }: { steps: number; children: React.ReactNode }) {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = grid.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Only stage the replay if the chat is still below the fold.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.6) return;

    const groups = [...el.querySelectorAll<HTMLElement>(".tp-msg-group")];
    const items = [...el.querySelectorAll<HTMLElement>(".tp-chat__step")];
    const typing = el.querySelector<HTMLElement>(".tp-typing");
    const timers: number[] = [];

    const setStep = (n: number) => {
      items.forEach((li, i) => {
        if (i < n) li.dataset.done = "true";
        else delete li.dataset.done;
        if (i === n) li.dataset.active = "true";
        else delete li.dataset.active;
      });
    };
    groups.forEach((g) => (g.dataset.show = "false"));
    setStep(-1);

    const play = () => {
      let t = 200;
      for (let i = 0; i < steps; i++) {
        timers.push(window.setTimeout(() => typing && (typing.dataset.show = "true"), t));
        t += TYPE_MS;
        timers.push(
          window.setTimeout(() => {
            if (typing) typing.dataset.show = "false";
            groups[i].dataset.show = "true";
            setStep(i);
          }, t),
        );
        t += READ_MS;
      }
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        play();
      },
      { threshold: 0.35 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [steps]);

  return (
    <div ref={grid} className="tp-chat__grid gutter" data-pin-range="true">
      {children}
    </div>
  );
}
