"use client";

import { useEffect, useRef } from "react";

/** Gaps between pops, cycled so the rhythm doesn't feel mechanical. */
const GAPS = [2600, 3400, 2900, 4100];

/**
 * The quilt lineup's small life. Hovering/focusing a pup shows its name tag;
 * every few seconds a random pup ducks under the quilt and pops back up with its
 * tag. The cycle pauses while you scroll, while the hero is off screen, and
 * while Teddy has walked away (the journey sets data-here="false", and the CSS
 * then tucks every pup under the quilt).
 */
export function HeroLineup({ children }: { children: React.ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stage.current;
    const hero = el?.closest<HTMLElement>(".tp-hero");
    if (!el || !hero) return;
    const pups = [...el.querySelectorAll<HTMLElement>(".tp-lineup__pup")];
    const ghosts = [...el.querySelectorAll<HTMLElement>(".tp-lineup__ghost")];
    const tag = (i: number, on: boolean) => {
      if (ghosts[i]) ghosts[i].dataset.tag = on ? "show" : "";
    };

    const cleanups = pups.map((pup, i) => {
      const on = () => tag(i, true);
      const off = () => tag(i, false);
      pup.addEventListener("pointerenter", on);
      pup.addEventListener("focus", on);
      pup.addEventListener("pointerleave", off);
      pup.addEventListener("blur", off);
      return () => {
        pup.removeEventListener("pointerenter", on);
        pup.removeEventListener("focus", on);
        pup.removeEventListener("pointerleave", off);
        pup.removeEventListener("blur", off);
      };
    });

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => cleanups.forEach((c) => c());

    let visible = true;
    let quietUntil = 0;
    let alive = true;
    let last = -1;
    let n = 0;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const hush = () => (quietUntil = performance.now() + 1200);
    addEventListener("scroll", hush, { passive: true });
    addEventListener("pointerdown", hush, { passive: true });
    el.addEventListener("pointerover", hush, { passive: true });

    const cycle = () => {
      if (!alive) return;
      if (document.hidden || !visible || performance.now() < quietUntil || hero.dataset.here === "false") {
        return later(cycle, 900);
      }
      const shown = pups.map((p, i) => (p.getClientRects().length ? i : -1)).filter((i) => i >= 0 && i !== last);
      const i = shown[Math.floor(Math.random() * shown.length)];
      if (i === undefined) return later(cycle, 2000);
      last = i;
      const pup = pups[i];
      pup.dataset.state = "duck";
      later(() => {
        pup.dataset.state = "pop";
        tag(i, true);
        later(() => tag(i, pup.matches(":hover, :focus-visible")), 1800);
        later(() => delete pup.dataset.state, 700);
      }, 360);
      later(cycle, GAPS[n++ % GAPS.length]);
    };
    // Start once the intro peek-up animation has finished.
    const intro = pups.flatMap((p) => p.getAnimations()).filter((a) => (a as CSSAnimation).animationName === "tp-peek");
    Promise.all(intro.map((a) => a.finished)).then(
      () => later(cycle, 250),
      () => later(cycle, 250),
    );

    return () => {
      alive = false;
      cleanups.forEach((c) => c());
      timers.forEach(clearTimeout);
      io.disconnect();
      removeEventListener("scroll", hush);
      removeEventListener("pointerdown", hush);
      el.removeEventListener("pointerover", hush);
    };
  }, []);

  return (
    <div ref={stage} className="tp-hero__stage">
      {children}
    </div>
  );
}
