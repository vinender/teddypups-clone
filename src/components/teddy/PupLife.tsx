"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ART_H, ART_W, EYE_Y, HEAD, TAIL } from "./rig";

const PET_LINES = ["woof!", "yip!", "I like you!", "boing!", "wheee!", "achoo!"];

/** What Teddy says the first time each scene's stop scrolls into view. */
const ARRIVAL_LINES: Record<string, string> = {
  peekaboo: "peekaboo!",
  tilt: "coming?",
  basket: "home soon!",
};

/** When the walking Teddy (PupJourney) is running, scene stops are his; static ones are hidden. */
const liveActor = (buddy: HTMLElement) => !!document.documentElement.dataset.pup && !!buddy.closest("[data-pup-stop]");

function say(buddy: HTMLElement, text: string, ms = 1600) {
  const bubble = buddy.querySelector<HTMLElement>(":scope > .pup-bubble");
  if (!bubble) return;
  bubble.textContent = text;
  bubble.dataset.show = "true";
  window.clearTimeout(Number(bubble.dataset.timer));
  bubble.dataset.timer = String(window.setTimeout(() => (bubble.dataset.show = "false"), ms));
}

function heart(buddy: HTMLElement) {
  const h = document.createElement("span");
  h.className = "pup-heart";
  h.textContent = "♥";
  h.setAttribute("aria-hidden", "true");
  h.style.left = `${45 + Math.random() * 30}%`;
  h.style.top = "10%";
  h.style.setProperty("--dx", `${(Math.random() - 0.5) * 3}rem`);
  buddy.append(h);
  h.addEventListener("animationend", () => h.remove(), { once: true });
}

type Idler = {
  buddy: HTMLElement;
  head?: SVGElement;
  tail?: SVGElement;
  blink?: SVGElement;
  eyes?: SVGElement;
  base: { head: string; tail: string };
  facing: number;
  canBlink: boolean;
  offset: number; // so several Teddys on a page don't move in lockstep
  visible: boolean;
  tilt: number;
  tiltTarget: number;
  nextTilt: number;
  nextBlink: number;
  blinkAt: number;
  gaze: { x: number; y: number };
  petAt: number;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Keeps every static <Teddy> idling: he blinks, wags his tail, now and then
 * cocks his head, follows the pointer with his eyes and wags harder when
 * petted, like the walking Teddy on the home page. Motion is layered on top of the pose's own transforms (an
 * extra rotate about the same pivots the rig uses), so any pose works.
 */
function idle(buddies: HTMLElement[]) {
  const t0 = performance.now() / 1000;
  const idlers: Idler[] = buddies.map((buddy, i) => {
    const part = (p: string) => buddy.querySelector<SVGElement>(`:scope > svg [data-p="${p}"]`) ?? undefined;
    const head = part("head");
    const tail = part("tail");
    return {
      buddy,
      head,
      tail,
      blink: part("blink"),
      eyes: part("eyes"),
      base: { head: head?.getAttribute("transform") ?? "", tail: tail?.getAttribute("transform") ?? "" },
      facing: buddy.dataset.facing === "left" ? -1 : 1,
      canBlink: Number(part("open")?.getAttribute("opacity") ?? 1) > 0.6,
      offset: i * 1.7,
      visible: false,
      tilt: 0,
      tiltTarget: 0,
      nextTilt: t0 + 2 + 3 * Math.random(),
      nextBlink: t0 + 0.8 + 2 * Math.random(),
      blinkAt: -1,
      gaze: { x: 0, y: 0 },
      petAt: -10,
    };
  });

  let pointer: { x: number; y: number; t: number } | null = null;
  const onMove = (e: PointerEvent) => (pointer = { x: e.clientX, y: e.clientY, t: performance.now() / 1000 });
  const onPet = (e: MouseEvent) => {
    const it = idlers.find((d) => d.buddy.contains(e.target as Node));
    if (it) it.petAt = performance.now() / 1000;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("click", onPet);

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const it = idlers.find((d) => d.buddy === e.target);
      if (it) it.visible = e.isIntersecting;
    }
  });
  idlers.forEach((d) => io.observe(d.buddy));

  let last = t0;
  let raf = 0;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const t = performance.now() / 1000;
    const dt = Math.min(0.05, t - last);
    last = t;
    for (const d of idlers) {
      if (!d.visible || liveActor(d.buddy)) continue;

      // Head tilt: hold one side for a beat, sometimes the other, then straighten.
      if (t > d.nextTilt) {
        d.tiltTarget = d.tiltTarget ? 0 : Math.random() < 0.5 ? 12 : -9;
        d.nextTilt = t + (d.tiltTarget ? 1.1 + 0.6 * Math.random() : 3 + 3 * Math.random());
      }
      // Eyes follow the pointer while it's moving nearby (same maths as TeddyRig.lookAt).
      let gx = 0;
      let gy = 0;
      if (pointer && t - pointer.t < 2.5) {
        const box = d.buddy.getBoundingClientRect();
        const hx = d.facing > 0 ? HEAD[0] : ART_W - HEAD[0];
        const dx = pointer.x - (box.left + (hx / ART_W) * box.width);
        const dy = pointer.y - (box.top + (EYE_Y / ART_H) * box.height);
        const dist = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, dist / 160);
        gx = (dx / dist) * k * d.facing;
        gy = (dy / dist) * k;
      }
      d.gaze.x += (gx - d.gaze.x) * (1 - Math.exp(-dt / 0.07));
      d.gaze.y += (gy - d.gaze.y) * (1 - Math.exp(-dt / 0.07));
      d.eyes?.setAttribute("transform", `translate(${r2(3.4 * d.gaze.x)} ${r2(2.6 * d.gaze.y)})`);

      d.tilt += (d.tiltTarget + 3 * d.gaze.x - d.tilt) * (1 - Math.exp(-dt / 0.18));
      d.head?.setAttribute("transform", `${d.base.head} rotate(${r2(d.tilt)} ${HEAD[0]} ${HEAD[1]})`);

      // Happy tail (the rig's wag 0.7: ~17° at 3 Hz), full wag for a while after a pet.
      const petted = t - d.petAt < 2.4;
      const wag = Math.sin((t + d.offset) * (petted ? 3.8 : 3) * Math.PI * 2) * (petted ? 22 : 17);
      d.tail?.setAttribute("transform", `${d.base.tail} rotate(${r2(wag)} ${TAIL[0]} ${TAIL[1]})`);

      // Blink every few seconds, sometimes twice in a row.
      if (d.canBlink && t > d.nextBlink) {
        d.blinkAt = t;
        d.nextBlink = t + (Math.random() < 0.18 ? 0.32 : 2.2 + 3.8 * Math.random());
      }
      const b = (t - d.blinkAt) / 0.15;
      const shut = b >= 0 && b <= 1 ? Math.sin(b * Math.PI) : 0;
      d.blink?.setAttribute("transform", `translate(0 ${r2(EYE_Y * shut * 0.92)}) scale(1 ${r2(1 - 0.92 * shut)})`);
    }
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("click", onPet);
    for (const d of idlers) {
      d.head?.setAttribute("transform", d.base.head);
      d.tail?.setAttribute("transform", d.base.tail);
      d.blink?.setAttribute("transform", "translate(0 0) scale(1 1)");
      d.eyes?.setAttribute("transform", "translate(0 0)");
    }
  };
}

/**
 * Brings every <Teddy> on the page to life: he idles (blinks, wags, tilts his
 * head, watches the pointer), click/tap to pet him, and he greets you once when his spot in a scene
 * first comes into view.
 */
export function PupLife() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let stop: (() => void) | null = null;
    const sync = () => {
      stop?.();
      stop = reduce.matches ? null : idle([...document.querySelectorAll<HTMLElement>(".pup-buddy")]);
    };
    sync();
    reduce.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      stop?.();
    };
  }, [pathname]);

  useEffect(() => {
    const buddies = [...document.querySelectorAll<HTMLElement>(".pup-buddy")];
    buddies.forEach((b) => (b.dataset.pet = ""));
    let n = 0;

    const onClick = (e: MouseEvent) => {
      const buddy = (e.target as Element).closest<HTMLElement>(".pup-buddy[data-pet]");
      if (!buddy || liveActor(buddy)) return;
      say(buddy, PET_LINES[n++ % PET_LINES.length], 1200);
      heart(buddy);
      buddy.removeAttribute("data-hop");
      void buddy.offsetWidth; // restart the hop animation
      buddy.dataset.hop = "";
    };
    document.addEventListener("click", onClick);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const stop = entry.target as HTMLElement;
          io.unobserve(stop);
          const line = ARRIVAL_LINES[stop.dataset.act ?? ""];
          const buddy = stop.querySelector<HTMLElement>(".pup-buddy");
          if (line && buddy && !liveActor(buddy)) window.setTimeout(() => say(buddy, line), 500);
        }
      },
      { threshold: 0.6 },
    );
    document.querySelectorAll("[data-pup-stop]").forEach((s) => io.observe(s));

    return () => {
      document.removeEventListener("click", onClick);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
