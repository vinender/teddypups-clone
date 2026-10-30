"use client";

import { useEffect, useRef } from "react";
import { cuePup } from "@/components/teddy/PupJourney";

const PIN_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
/** A door opens once it slides past this fraction of the viewport width. */
const OPEN_AT = 0.36;

/**
 * Scroll-pinned "hallway": on wide screens the stage sticks to the viewport and
 * vertical scrolling walks the row of doors sideways (spring-smoothed). Doors
 * start shut and swing open as they reach Teddy, who walks in place on the
 * "treadmill". Small screens and reduced motion keep the plain grid.
 */
export function MeetPin({ children }: { children: React.ReactNode }) {
  const range = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = range.current;
    const section = el?.closest<HTMLElement>(".tp-meet");
    const stage = el?.querySelector<HTMLElement>(".tp-meet__stage");
    const hall = el?.querySelector<HTMLElement>(".tp-meet__hall");
    const track = el?.querySelector<HTMLElement>(".tp-meet__track");
    const teddy = el?.querySelector<HTMLElement>(".tp-meet__teddy");
    if (!el || !section || !stage || !hall || !track) return;
    const mq = window.matchMedia(PIN_QUERY);
    const doors = [...track.children] as HTMLElement[];
    let travel = 0;
    let x = 0; // rendered offset
    let v = 0; // spring velocity
    let raf = 0;
    let last = 0;
    let pinned = false;

    const target = () => {
      const top = el.getBoundingClientRect().top;
      return travel > 0 ? -Math.min(1, Math.max(0, -top / travel)) * travel : 0;
    };
    const render = (cue: boolean) => {
      track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      hall.style.setProperty("--floor-x", `${x.toFixed(1)}px`);
      const line = OPEN_AT * innerWidth;
      for (const d of doors) {
        if (d.classList.contains("tp-door--all")) continue;
        const open = d.offsetLeft + x < line;
        if ((d.dataset.open === "true") !== open) {
          d.dataset.open = String(open);
          if (open && cue) cuePup({ look: d, secs: 0.9 });
        }
      }
    };
    // Underdamped spring toward the scroll position: the hallway glides rather than jerks.
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      const goal = target();
      const k = 170 / 0.35;
      const c = 32 / 0.35;
      // Semi-implicit Euler in small sub-steps: a stiff spring is unstable with frame-sized steps.
      const n = Math.ceil(dt / (1 / 240));
      for (let i = 0; i < n; i++) {
        v += (k * (goal - x) - c * v) * (dt / n);
        x += v * (dt / n);
      }
      if (Math.abs(goal - x) < 0.3 && Math.abs(v) < 0.3) {
        x = goal;
        v = 0;
        raf = 0;
      } else raf = requestAnimationFrame(step);
      render(true);
    };
    const onScroll = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };

    const measure = () => {
      const wants = mq.matches;
      if (!wants) {
        if (pinned) {
          pinned = false;
          delete section.dataset.pinned;
          el.style.height = "";
          track.style.transform = "";
          hall.style.removeProperty("--door-w");
          teddy?.removeAttribute("data-act");
          doors.forEach((d) => (d.dataset.open = "true"));
          removeEventListener("scroll", onScroll);
        }
        return;
      }
      if (!pinned) {
        pinned = true;
        section.dataset.pinned = "";
        teddy?.setAttribute("data-act", "treadmill");
        addEventListener("scroll", onScroll, { passive: true });
      }
      // Size doors so the tallest plate + door + floor fit the sticky stage.
      const head = stage.querySelector<HTMLElement>(".tp-meet__head");
      const plate = Math.max(
        64,
        ...[...track.querySelectorAll<HTMLElement>(".tp-door__plate")].map((p) => p.offsetHeight),
      );
      const floor = hall.querySelector<HTMLElement>(".tp-meet__floor")?.offsetHeight ?? 0;
      const room = (stage.clientHeight - (head ? head.offsetTop + head.offsetHeight : 0) - floor - plate - 40) / 1.3;
      hall.style.setProperty("--door-w", `${Math.max(128, Math.min(256, 0.15 * innerWidth, room)).toFixed(0)}px`);
      travel = Math.max(0, track.scrollWidth - innerWidth);
      el.style.height = `${innerHeight + travel}px`;
      x = target();
      v = 0;
      render(false);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(stage);
    mq.addEventListener("change", measure);
    addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
      removeEventListener("resize", measure);
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={range} data-pin-range="true">
      {children}
    </div>
  );
}
