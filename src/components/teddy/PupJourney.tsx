"use client";

import { useEffect, useRef } from "react";
import { PAW_PATH } from "@/components/art/paths";
import { TeddyArt } from "./TeddyArt";
import { ART_W, FEET, POSES, type PoseName, TeddyRig } from "./rig";
import { TEDDY_POSES } from "./teddy-poses";

/*
 * Teddy's walk through the page.
 *
 * Every scene marks where Teddy sits with a [data-pup-stop]. We measure those
 * stops, give each a "hold" range of scroll positions where Teddy stays put,
 * and between holds he walks (or hops) along a smooth curve to the next stop,
 * leaving fading paw prints. While a scene is being read he idles: blinks,
 * wags, looks at things, does the odd trick. The static <Teddy>s at the stops
 * are hidden (html[data-pup]) while this live actor is running.
 */

type Box = readonly [number, number, number, number]; // drawn extent in art units
type Track =
  | { kind: "page"; top: number }
  | { kind: "screen"; top: number }
  | { kind: "pin"; top: number; from: number; to: number };
type Stop = { x: number; track: Track; s: number; behind: boolean; sink: number; box: Box };
type Meta = {
  scene: HTMLElement | null;
  pose: PoseName;
  facing: number;
  act: string;
  looks: HTMLElement[];
  treadmill: HTMLElement | null;
};
type Layout = {
  lane: boolean;
  stops: Stop[];
  meta: Meta[];
  holds: [number, number][];
  blend: number;
  mainTop: number;
};
type Safe = { left: number; top: number; right: number; bottom: number };
type Pt = { x: number; y: number };
type Place = Pt & { s: number; front: boolean; airborne: boolean; k: number; t: number; walked: number };
type Step = [at: number, run: (now: number) => void];

const BOXES: Partial<Record<string, Box>> = {
  sit: [50, 26, 284, 234],
  peek: [148, 34, 280, 163],
  snug: [148, 40, 280, 163],
  bow: [58, 56, 292, 236],
};
const DEFAULT_BOX: Box = [48, 30, 288, 236];
const boxFor = (pose: string) => BOXES[pose] ?? DEFAULT_BOX;
/** In lane mode Teddy hides his body below the screen edge, showing only the peek. */
const LANE_SINK = FEET.y - 159;
/** Where on screen (fraction of height) a stop should sit while it is held. */
const HOLD_BAND = { desktop: [0.42, 0.78], lane: [0.6, 0.86] } as const;
const MOBILE = "(max-width: 767px), (pointer: coarse) and (max-height: 519px)";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (t: number) => t * t * (3 - 2 * t);
const ramp = (a: number, b: number, t: number) => (b === a ? +(t >= b) : smooth(clamp01((t - a) / (b - a))));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixBox = (a: Box, b: Box, t: number): Box => [
  mix(a[0], b[0], t),
  mix(a[1], b[1], t),
  mix(a[2], b[2], t),
  mix(a[3], b[3], t),
];
/** Smooth max/min (softplus), so clamping Teddy into the viewport never looks like a hard stop. */
const softMax = (v: number, lo: number, k: number) => {
  const z = (v - lo) / k;
  return z > 20 ? v : lo + k * Math.log1p(Math.exp(z));
};
const softMin = (v: number, hi: number, k: number) => -softMax(-v, -hi, k);
const bezier = (p0: Pt, c1: Pt, c2: Pt, p1: Pt, t: number): Pt => {
  const u = 1 - t;
  const [a, b, c, d] = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return { x: a * p0.x + b * c1.x + c * c2.x + d * p1.x, y: a * p0.y + b * c1.y + c * c2.y + d * p1.y };
};

function trackTop(track: Track, scrollY: number) {
  if (track.kind === "page") return track.top - scrollY;
  if (track.kind === "screen") return track.top;
  if (scrollY < track.from) return track.top - (scrollY - track.from);
  if (scrollY > track.to) return track.top - (scrollY - track.to);
  return track.top;
}
/** Viewport position of a stop's feet at a given scroll. */
const feetAt = (s: Stop, scrollY: number): Pt => ({
  x: s.x + FEET.x * s.s,
  y: trackTop(s.track, scrollY) + FEET.y * s.s,
});

/** Which hold we're in (t = 0) or how far along the walk from hold k to k+1 (0 < t < 1). */
function holdAt(holds: [number, number][], y: number) {
  if (!holds.length || y <= holds[0][1]) return { k: 0, t: 0 };
  for (let i = 0; i < holds.length - 1; i++) {
    const end = holds[i][1];
    const next = holds[i + 1][0];
    if (y < next) return { k: i, t: clamp01((y - end) / Math.max(1, next - end)) };
    if (y <= holds[i + 1][1]) return { k: i + 1, t: 0 };
  }
  return { k: holds.length - 1, t: 0 };
}

/** Keep Teddy's drawn box inside the safe area (softly). */
function keepInside(x: number, y: number, s: number, box: Box, safe: Safe, k = 8): Pt {
  const left = (FEET.x - box[0]) * s;
  const right = (box[2] - FEET.x) * s;
  const up = (FEET.y - box[1]) * s;
  const down = (box[3] - FEET.y) * s;
  return {
    x:
      safe.right - safe.left > left + right
        ? softMin(softMax(x, safe.left + left, k), safe.right - right, k)
        : (safe.left + safe.right) / 2 - (right - left) / 2,
    y:
      safe.bottom - safe.top > up + down
        ? softMin(softMax(y, safe.top + up, k), safe.bottom - down, k)
        : safe.bottom - down,
  };
}

/** Stops inside a sticky container move with it while pinned. */
function trackFor(el: HTMLElement, rect: DOMRect): Track {
  let sticky: HTMLElement | null = null;
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    if (getComputedStyle(p).position === "sticky") {
      sticky = p;
      break;
    }
  }
  if (!sticky) return { kind: "page", top: rect.top + scrollY };
  const stickTop = parseFloat(getComputedStyle(sticky).top) || 0;
  const offset = rect.top - sticky.getBoundingClientRect().top;
  // Measure the sticky box at its natural position to find the pinned scroll range.
  const prev = sticky.style.position;
  sticky.style.position = "relative";
  const natural = sticky.getBoundingClientRect();
  const parent = sticky.parentElement!;
  const parentBottom =
    parent.getBoundingClientRect().bottom - (parseFloat(getComputedStyle(parent).paddingBottom) || 0);
  sticky.style.position = prev;
  const from = natural.top + scrollY - stickTop;
  const to = parentBottom + scrollY - natural.height - stickTop;
  return to <= from
    ? { kind: "page", top: natural.top + scrollY + offset }
    : { kind: "pin", top: stickTop + offset, from, to };
}

/** Squeeze per-stop hold ranges so each walk between them gets at least `gaps[i]` of scroll. */
function fitHolds(ranges: [number, number][], gaps: number[], maxScroll: number) {
  const h = ranges.map(([a, b]): [number, number] => (a <= b ? [a, b] : [(a + b) / 2, (a + b) / 2]));
  if (!h.length) return h;
  h[0][0] = -Infinity;
  const last = h[h.length - 1];
  last[1] = Infinity;
  last[0] = Math.min(last[0], maxScroll - 1);
  for (let i = 0; i < h.length - 1; i++) {
    const a = h[i];
    const b = h[i + 1];
    if (b[0] < a[1]) {
      const mid = (a[1] + b[0]) / 2;
      a[1] = Math.max(a[0], mid);
      b[0] = Math.min(b[1], mid);
      if (b[0] < a[1]) b[0] = a[1];
    }
    let need = gaps[i] - (b[0] - a[1]);
    if (need > 0) {
      const fromA = Math.min(need / 2, a[1] - a[0]);
      const fromB = Math.min(need / 2, b[1] - b[0]);
      a[1] -= fromA;
      b[0] += fromB;
      need -= fromA + fromB;
      const more = Math.min(need, b[1] - b[0]);
      b[0] += more;
      need -= more;
      if (need > 0) a[1] -= Math.min(need, a[1] - a[0]);
    }
  }
  for (const r of h) if (r[1] < r[0]) r[1] = r[0];
  return h;
}

const whatsappBarTop = () => {
  const bar = document.querySelector("[data-whatsapp-bar]");
  const r = bar?.getClientRects().length ? bar.getBoundingClientRect() : null;
  return r && r.height ? r.top : innerHeight - 6;
};

function measure(probe: HTMLElement): Layout {
  const lane = matchMedia(MOBILE).matches;
  const width = document.documentElement.clientWidth;
  const vh = probe.getBoundingClientRect().height || innerHeight;
  const headerH = document.getElementById("site-header")?.offsetHeight ?? 76;
  const bar = document.querySelector("[data-whatsapp-bar]");
  const safe: Safe = {
    left: 10,
    top: headerH + 10,
    right: width - 10,
    bottom: vh - 10 - (bar?.getClientRects().length ? bar.getBoundingClientRect().height : 0),
  };
  const stops: Stop[] = [];
  const meta: Meta[] = [];
  const ranges: [number, number][] = [];
  const band = lane ? HOLD_BAND.lane : HOLD_BAND.desktop;

  const addStop = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const pose = (el.dataset.pose || "sit") as PoseName;
    const act = el.dataset.act ?? "";
    const base = rect.width / ART_W;
    const s = act === "basket" || lane ? base : 1.12 * base; // the live Teddy is drawn a touch bigger
    const anchor = pose === "peek" ? { x: FEET.x, y: 159 } : FEET;
    const track = trackFor(el, rect);
    if (track.kind !== "screen") track.top += anchor.y * (base - s);
    const stop: Stop = {
      x: rect.left + anchor.x * (base - s),
      track,
      s,
      behind: el.dataset.behind === "true",
      sink: 0,
      box: boxFor(pose),
    };
    const scene = el.closest<HTMLElement>("[data-pup-scene]");
    stops.push(stop);
    meta.push({
      scene,
      pose,
      facing: el.dataset.facing === "left" ? -1 : 1,
      act,
      looks: scene ? [...scene.querySelectorAll<HTMLElement>("[data-pup-look]")] : [],
      treadmill: act === "treadmill" ? (scene?.querySelector<HTMLElement>("[data-treadmill]") ?? null) : null,
    });

    // Hold while the stop sits inside the comfortable band of the screen.
    let range: [number, number];
    if (track.kind === "pin") range = [track.from, track.to];
    else {
      const top = track.top + stop.box[1] * s;
      const bottom = track.top + stop.box[3] * s;
      const mid = (top + bottom) / 2;
      const h = safe.bottom - safe.top;
      let lo = mid - (safe.top + band[1] * h);
      let hi = mid - (safe.top + band[0] * h);
      lo = Math.max(lo, bottom - safe.bottom);
      hi = Math.min(hi, top - safe.top);
      if (lo > hi) lo = hi = mid - (safe.top + h / 2);
      range = [lo, hi];
      // Don't keep sitting once the scene above has scrolled mostly away.
      if (!lane && scene && act !== "basket" && act !== "peekaboo") {
        const sceneTop = scene.getBoundingClientRect().top + scrollY - safe.top + 0.08 * h;
        const floor = bottom - safe.bottom;
        if (range[1] > sceneTop) {
          const end = Math.max(sceneTop, floor + 0.12 * h);
          range = [Math.max(floor, end - Math.max(range[1] - range[0], 0.2 * h)), end];
        }
      }
    }
    ranges.push(range);
  };

  const all = [...document.querySelectorAll<HTMLElement>("[data-pup-stop]")].filter((e) => e.getClientRects().length);
  if (lane) {
    // Phones: start in the hero, peek in from alternating edges for each scene, end in the basket.
    const laneStops = all.filter((e) => e.dataset.lane === "true");
    if (laneStops[0]) addStop(laneStops[0]);
    const first = meta[0]?.scene ?? null;
    const scenes = [...document.querySelectorAll<HTMLElement>("#main [data-pup-scene]")].filter(
      (e) => e !== first && e.getClientRects().length,
    );
    const s = Math.min(0.62, Math.max(0.5, width / 650));
    const box = boxFor("peek");
    scenes.forEach((scene, i) => {
      const fromLeft = i % 2 === 0;
      stops.push({
        x: fromLeft ? safe.left + 2 - box[0] * s : safe.right - 2 - box[2] * s,
        track: { kind: "screen", top: 0 },
        s,
        behind: false,
        sink: LANE_SINK,
        box,
      });
      meta.push({ scene, pose: "peek", facing: fromLeft ? 1 : -1, act: "lane", looks: [], treadmill: null });
      const r = scene.getBoundingClientRect();
      const a = r.top + scrollY - 0.42 * vh;
      const b = r.bottom + scrollY - 0.58 * vh;
      ranges.push(a <= b ? [a, b] : [(a + b) / 2, (a + b) / 2]);
    });
    if (laneStops.length > 1) addStop(laneStops[laneStops.length - 1]);
  } else all.forEach(addStop);

  // Each walk gets scroll room proportional to the distance covered.
  const gaps = stops.slice(1).map((b, i) => {
    const a = stops[i];
    const dist = Math.hypot(
      b.x + FEET.x * b.s - (a.x + FEET.x * a.s),
      (HOLD_BAND.desktop[1] - HOLD_BAND.desktop[0]) * vh,
    );
    return Math.min(1.4 * vh, Math.max((lane ? 0.32 : 0.5) * vh, 1.15 * dist));
  });
  const main = document.getElementById("main");
  return {
    lane,
    stops,
    meta,
    holds: fitHolds(ranges, gaps, document.documentElement.scrollHeight - innerHeight),
    blend: 0.12 * vh,
    mainTop: main ? main.getBoundingClientRect().top + scrollY : 0,
  };
}

/** Where Teddy is (viewport coords of his feet), his scale, and which leg of the journey. */
function place(L: Layout, y: number, safe: Safe): Place {
  const { k, t } = holdAt(L.holds, y);
  if (t <= 0 || k >= L.stops.length - 1) {
    const s = L.stops[k];
    const p = feetAt(s, y);
    const c = keepInside(p.x, p.y, s.s, s.box, safe);
    return { ...c, s: s.s, front: !s.behind, airborne: false, k, t: 0, walked: 0 };
  }
  const a = L.stops[k];
  const b = L.stops[k + 1];
  const start = L.holds[k][1];
  const end = L.holds[k + 1][0];
  const span = Math.max(1, end - start);
  const v = clamp01((y - start) / span);
  const pa = feetAt(a, start);
  const pb = feetAt(b, end);
  const p0 = { x: pa.x, y: pa.y - a.sink * a.s };
  const p1 = { x: pb.x, y: pb.y - b.sink * b.s };

  // Curve: leave and arrive horizontally; bulge sideways if the stops are nearly stacked.
  const dx = p1.x - p0.x;
  const dir = dx >= 0 ? 1 : -1;
  const reach = 0.45 * Math.abs(dx);
  let c1 = { x: p0.x + dir * reach, y: p0.y };
  let c2 = { x: p1.x - dir * reach, y: p1.y };
  const minSpread = 0.14 * (safe.right - safe.left);
  if (Math.abs(dx) < minSpread) {
    const bulge = ((p0.x + p1.x) / 2 < (safe.left + safe.right) / 2 ? 1 : -1) * (minSpread - Math.abs(dx)) * 0.9;
    c1 = { x: c1.x + bulge, y: mix(p0.y, p1.y, 0.2) };
    c2 = { x: c2.x + bulge, y: mix(p0.y, p1.y, 0.8) };
  }
  const inSafe = (p: Pt) => ({
    x: Math.min(safe.right, Math.max(safe.left, p.x)),
    y: Math.min(safe.bottom, Math.max(safe.top, p.y)),
  });
  c1 = inSafe(c1);
  c2 = inSafe(c2);

  const e = v * v * v * (v * (6 * v - 15) + 10); // smootherstep
  const pt = bezier(p0, c1, c2, p1, e);
  const s = mix(a.s, b.s, smooth(clamp01(v / 0.65)));
  // Near each end, follow the stop as the page keeps scrolling so there's no jump at the hand-over.
  const blendW = Math.min(0.3, Math.max(0.06, L.blend / span));
  const leave = 1 - ramp(0, blendW, v);
  const arrive = ramp(1 - blendW, 1, v);
  let py = pt.y + leave * (feetAt(a, y).y - pa.y) + arrive * (feetAt(b, y).y - pb.y);
  py += a.sink * a.s * (1 - ramp(0, 0.22, v)) + b.sink * b.s * ramp(0.78, 1, v);

  // Hop out from behind / into a hiding place (quilt, basket).
  let airborne = false;
  if (a.behind && v < 0.36) {
    py -= Math.sin((v / 0.36) * Math.PI) * Math.min(64 * a.s, 72);
    airborne = v < 0.32;
  }
  if (b.behind && v > 0.68) {
    py -= Math.sin(((v - 0.68) / 0.32) * Math.PI) * Math.min(56 * b.s, 60);
    airborne = true;
  }
  if (a.sink && v < 0.2) airborne = true;
  const front = !((a.behind && v < 0.12) || (b.behind && v > 0.92));
  const box =
    v < 0.5
      ? mixBox(a.box, DEFAULT_BOX, ramp(0, a.sink ? 0.22 : a.behind ? 0.36 : 0.06, v))
      : mixBox(DEFAULT_BOX, b.box, ramp(b.sink ? 0.78 : b.behind ? 0.68 : 0.94, 1, v));
  const c = keepInside(pt.x, py, s, box, safe);

  // Distance walked along the curve, to sync the legs.
  let walked = 0;
  let prev = p0;
  const n = Math.max(1, Math.ceil(32 * e));
  for (let i = 1; i <= n; i++) {
    const q = bezier(p0, c1, c2, p1, (i / n) * e);
    walked += Math.hypot(q.x - prev.x, q.y - prev.y);
    prev = q;
  }
  return { ...c, s, front, airborne, k, t: v, walked };
}

const setData = (el: HTMLElement, key: string, v: string) => {
  if (el.dataset[key] !== v) el.dataset[key] = v;
};
const pick = <T,>(list: T[], not: T | null) => {
  const pool = list.filter((x) => x !== not);
  return pool[Math.floor(Math.random() * pool.length)];
};

/** Ask the live Teddy to glance at something (e.g. a door that just opened) or say something. */
export function cuePup(detail: { look?: Element; say?: string; secs?: number }) {
  dispatchEvent(new CustomEvent("pup:cue", { detail }));
}

export function PupJourney() {
  const layer = useRef<HTMLDivElement>(null);
  const actor = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLSpanElement>(null);
  const bubbleAt = useRef<HTMLSpanElement>(null);
  const prints = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layerEl = layer.current!;
    const actorEl = actor.current!;
    const bodyEl = body.current!;
    const bubbleEl = bubble.current!;
    const bubbleAtEl = bubbleAt.current!;
    const printEls = [...prints.current!.children] as SVGSVGElement[];
    const probeEl = probe.current!;
    const svg = bodyEl.querySelector("svg")!;
    const root = document.documentElement;
    const header = document.getElementById("site-header");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    let L: Layout | null = null;
    let rig: TeddyRig | null = null;
    let running = false;
    let raf = 0;
    let resizeTimer = 0;

    // Frame state
    const now = () => performance.now() / 1000;
    let last = now();
    let lastScroll = scrollY;
    let scrolledAt = now();
    let scrollDir = 1;
    let prev: Pt | null = null;
    let current: Place | null = null;
    let correction = { x: 0, y: 0, s: 0 }; // decays: smooths over re-measures and snaps
    let snapped = false;
    let laneFollow: Pt | null = null;
    let laneBarY = 0;
    let layerShift = 0;
    let holding = -1; // index of the stop we're sitting at, -1 while walking
    let heldSince = 0;
    let idleSince = 0;
    let script: Step[] = [];
    let lookIdx = -1;
    let lookedAt = 0;
    let treadX: number | null = null;
    let treadStill = 0;
    let printLeg = -1;
    let printStep = 0;
    let printNext = 0;
    let stillFor = 0;
    let laneWalked = 0;
    let nextYawn = 0;
    let bubbleUntil = 0;
    let look: { el: Element; until: number } | null = null;
    let pointer: (Pt & { t: number }) | null = null;
    let lastTrick: string | null = null;

    const say = (text: string, t: number, secs = 1.4) => {
      bubbleEl.textContent = text;
      bubbleEl.dataset.show = "true";
      bubbleUntil = t + secs;
    };
    const hearts = () => {
      if (!current || !rig) return;
      const s = current.s;
      const x = current.x - FEET.x * s + (rig.facingDir > 0 ? 212 : ART_W - 212) * s;
      const y = current.y - (FEET.y - 40) * s - layerShift;
      for (let i = 0; i < 3; i++) {
        const h = document.createElement("span");
        h.className = "pup-heart";
        h.textContent = "♥";
        h.style.left = `${x}px`;
        h.style.top = `${y}px`;
        layerEl.append(h);
        const dx = (Math.random() - 0.5) * 50;
        h.animate(
          [
            { opacity: 0, transform: "translate(-50%, 0) scale(.5)" },
            { opacity: 1, transform: `translate(calc(-50% + ${dx / 2}px), -24px) scale(1)`, offset: 0.25 },
            { opacity: 0, transform: `translate(calc(-50% + ${dx}px), -70px) scale(1.15)` },
          ],
          { duration: 1100 + i * 160, delay: i * 120, easing: "ease-out", fill: "backwards" },
        ).onfinish = () => h.remove();
      }
    };

    // Little routines (lists of timed steps) for idle moments and when he's clicked.
    const tricks = (r: TeddyRig, at: Meta) => ({
      woof: (t: number): Step[] => [
        [t, (n) => (r.woof(n), say("woof!", n))],
        [t + 0.4, (n) => r.woof(n)],
      ],
      hop: (t: number): Step[] => [
        [t, (n) => (r.hop(1.35), say(pick(["wheee!", "boing!", "yip!"], null), n))],
        [t + 0.5, () => r.hop(0.7)],
      ],
      love: (t: number): Step[] => [[t, (n) => (r.wag(1), r.hop(0.5), hearts(), say("I like you!", n))]],
      sneeze: (t: number): Step[] => [[t, (n) => (r.jolt(1.4), r.hop(0.4), r.yawn(n, 0.22), say("achoo!", n))]],
      tilt: (t: number): Step[] => [
        [t, () => r.cock(14)],
        [t + 0.9, () => r.cock(-10)],
        [t + 1.8, () => r.cock(0)],
      ],
      bow: (t: number): Step[] => [
        [t, () => (r.setPose("bow"), r.wag(1))],
        [t + 1.3, () => (r.setPose(at.pose), r.wag(0.7))],
      ],
      peekaboo: (t: number): Step[] => [
        [t, () => r.setPose({ ...POSES.peek, headY: 120 })],
        [t + 0.7, (n) => (r.setPose("peek"), r.jolt(1.2), say("peekaboo!", n, 1.6))],
      ],
    });

    const safeArea = (lane: boolean): Safe => {
      const w = root.clientWidth;
      const top = (header?.offsetHeight ?? 76) + 10;
      if (lane) return { left: 10, top, right: w - 10, bottom: whatsappBarTop() + 40 };
      return { left: 10, top, right: w - 10, bottom: innerHeight - 10 };
    };
    const locate = (y: number) => {
      if (!L) return null;
      if (L.lane) {
        const barY = whatsappBarTop();
        for (const s of L.stops) if (s.track.kind === "screen") s.track.top = barY - 159 * s.s;
      }
      return place(L, y, safeArea(L.lane));
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!L || !rig) return;
      const t = now();
      const dt = Math.min(0.05, t - last);
      last = t;
      const y = scrollY;
      const dy = y - lastScroll;
      lastScroll = y;
      if (Math.abs(dy) > 0.5) {
        scrolledAt = t;
        scrollDir = dy > 0 ? 1 : -1;
      }
      while (script.length && script[0][0] <= t) script.shift()![1](t);

      // Once scrolling settles, don't leave him frozen mid-hop: snap to the nearest landing.
      let y2 = y;
      if (t - scrolledAt > 0.25) {
        const { k, t: v } = holdAt(L.holds, y);
        if (v > 0 && k < L.stops.length - 1) {
          const a = L.stops[k];
          const b = L.stops[k + 1];
          const lo = a.sink ? 0.22 : a.behind ? 0.36 : 0;
          const hi = b.sink ? 0.78 : b.behind ? 0.68 : 1;
          let w = v;
          if (v < lo) w = v < lo / 2 ? 0 : lo;
          else if (v > hi) w = v > (1 + hi) / 2 ? 1 : hi;
          if (w !== v) y2 = L.holds[k][1] + w * (L.holds[k + 1][0] - L.holds[k][1]);
        }
      }
      const p = locate(y2)!;
      const a = L.stops[p.k];
      const b = p.t > 0 ? L.stops[p.k + 1] : a;
      const laneGlide = L.lane && a.track.kind === "screen" && b?.track.kind === "screen";

      const decay = Math.exp(-dt / 0.28);
      correction.x *= decay;
      correction.y *= decay;
      correction.s *= decay;
      if (Math.abs(correction.x) < 0.05 && Math.abs(correction.y) < 0.05) correction.x = correction.y = 0;
      const isSnapped = y2 !== y;
      if (isSnapped !== snapped && prev && !laneGlide) correction = { ...correction, x: prev.x - p.x, y: prev.y - p.y };
      snapped = isSnapped;

      const s = p.s + correction.s;
      let x = p.x + correction.x;
      let fy = p.y + correction.y;
      const barY = L.lane ? whatsappBarTop() : 0;
      let settled = true;
      if (laneGlide) {
        // Between edge peeks on phones, glide along the bottom bar instead of tracking scroll.
        laneFollow ??= prev ? { x: prev.x, y: prev.y - laneBarY } : { x, y: fy - barY };
        const k = 1 - Math.exp(-dt / 0.14);
        laneFollow.x += (x - laneFollow.x) * k;
        laneFollow.y += (fy - barY - laneFollow.y) * k;
        settled = Math.hypot(x - laneFollow.x, fy - barY - laneFollow.y) < 1.5;
        x = laneFollow.x;
        fy = barY + laneFollow.y;
      } else if (laneFollow) {
        correction = { ...correction, x: (prev?.x ?? x) - p.x, y: (prev?.y ?? fy) - p.y };
        x = p.x + correction.x;
        fy = p.y + correction.y;
        laneFollow = null;
      }
      laneBarY = barY;
      current = { ...p, x, y: fy, s };
      setData(layerEl, "anchor", laneGlide ? "bottom" : "top");
      layerShift = laneGlide ? layerEl.getBoundingClientRect().top : 0;

      const isHolding = p.t === 0 && settled;
      const k = p.k;
      if (isHolding) {
        const m = L.meta[k];
        if (holding !== k) {
          // Arrived: settle into this scene's pose.
          script = [];
          look = null;
          holding = k;
          heldSince = t;
          idleSince = t;
          treadX = null;
          rig.reset();
          rig.setPose(m.pose);
          rig.face(m.facing, 0.14);
          rig.stride(0);
          rig.wag(m.act === "basket" ? 0.3 : 0.7);
          rig.jolt(0.4);
          nextYawn = t + 2.4;
        }
        if (m.treadmill && !script.length) {
          // The hallway slides under him: walk in place in the direction of travel.
          const left = m.treadmill.getBoundingClientRect().left;
          const moved = treadX === null ? 0 : left - treadX;
          treadX = left;
          rig.walkedTo(-left / s);
          if (Math.abs(moved) > 0.15) {
            treadStill = 0;
            rig.setPose("walk");
            rig.stride(1);
            rig.face(moved < 0 ? 1 : -1, 0.16);
          } else if ((treadStill += dt) > 0.25) {
            rig.setPose("stand");
            rig.stride(0);
          }
        }
        if (m.act === "tilt" && !script.length && t - heldSince > 1.2) {
          const w = Math.sin(0.9 * t);
          rig.cock(w > 0.35 ? 13 : w < -0.35 ? -10 : 0);
        }
        if (m.act === "basket" && !script.length && t > nextYawn) {
          nextYawn = t + 4.5 + 3 * Math.random();
          if (Math.random() < 0.7) rig.jolt(0.55);
          else rig.yawn(t, 0.7);
        }
        // Glance around the scene's points of interest.
        const busy = (look && look.until > t) || (pointer && t - pointer.t < 2.5);
        if (m.looks.length && !busy && t - heldSince > 0.8 && t - lookedAt > 1.7) {
          lookedAt = t;
          lookIdx = (lookIdx + 1) % (m.looks.length + 1);
          if (lookIdx < m.looks.length) look = { el: m.looks[lookIdx], until: t + 1.4 };
        }
        if (Math.abs(dy) > 0.5) idleSince = t;
        if (!script.length && !m.treadmill && t - idleSince > 5) {
          idleSince = t;
          script =
            Math.random() < 0.7
              ? tricks(rig, m).tilt(t)
              : [
                  [t, () => rig!.wag(1)],
                  [t + 2.4, () => rig!.wag(m.act === "basket" ? 0.3 : 0.7)],
                ];
        }
      } else {
        if (holding !== -1) {
          holding = -1;
          script = [];
          rig.reset();
        }
        const moved = prev ? Math.hypot(x - prev.x, fy - prev.y) : 0;
        stillFor = moved > 0.25 ? 0 : stillFor + dt;
        let airborne = p.airborne;
        if (L.lane && p.t > 0) {
          if (a.sink && p.t < 0.22) airborne = scrollDir > 0;
          else if (b?.sink && p.t > 0.78) airborne = scrollDir < 0;
        }
        if (airborne) {
          rig.setPose("hop");
          rig.stride(0);
          rig.cock(0);
        } else if (stillFor > 0.3) {
          rig.setPose("stand");
          rig.stride(0);
          if (stillFor > 2.6 && stillFor - dt <= 2.6) say("coming?", t);
          // Waiting mid-path: wag and cock his head now and then, like at a stop.
          const w = Math.sin(0.9 * stillFor - 1.5);
          rig.cock(stillFor > 1.5 ? (w > 0.6 ? 12 : w < -0.6 ? -9 : 0) : 0);
        } else {
          rig.setPose("walk");
          rig.stride(1);
          rig.cock(0);
        }
        rig.walkedTo((laneGlide ? (laneWalked += moved) : p.walked) / Math.max(0.05, s));
        if (prev) {
          const mx = x - prev.x;
          if (Math.abs(mx) > 0.6 && Math.abs(mx) > 0.35 * Math.abs(fy - prev.y)) rig.face(mx > 0 ? 1 : -1, 0.16);
        }
        // Paw prints: one per step, alternating feet, fading out.
        if (!L.lane) {
          const step = Math.floor(p.walked / (34 * s));
          if (printLeg === k && step !== printStep && !p.airborne && prev) {
            const odd = step & 1;
            const foot = odd ? 186 : 110;
            const left = x - FEET.x * s;
            const top = fy - FEET.y * s;
            const px = left + (rig.facingDir > 0 ? foot : ART_W - foot) * s;
            const py = top + 226 * s + y - L.mainTop + (odd ? -4 : 4) * s;
            const angle = Math.atan2(fy - prev.y + dy, x - prev.x) + Math.PI / 2;
            const size = 14 * Math.max(0.75, 1.5 * s);
            const el = printEls[printNext++ % printEls.length];
            el.style.transform = `translate(${(px - size / 2).toFixed(1)}px, ${(py - size / 2).toFixed(1)}px) rotate(${angle.toFixed(3)}rad)`;
            el.style.width = el.style.height = `${size.toFixed(1)}px`;
            el.animate(
              [{ opacity: 0 }, { opacity: 0.45, offset: 0.08 }, { opacity: 0.45, offset: 0.5 }, { opacity: 0 }],
              { duration: 2600, easing: "ease-out" },
            );
          }
          printLeg = k;
          printStep = step;
        }
      }

      // Scenes know whether Teddy is "here" (the hero tucks its pups away when he leaves).
      L.meta.forEach((m, i) => {
        if (!m.scene) return;
        setData(m.scene, "here", String(isHolding && i === k));
        setData(m.scene, "visited", String(i <= k || (i === k + 1 && p.t > 0.92)));
      });

      if (look && look.until > t) {
        const r = look.el.getBoundingClientRect();
        rig.lookAt({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      } else rig.lookAt(pointer && t - pointer.t < 2.5 ? pointer : null);

      actorEl.style.transform = `translate3d(${(x - FEET.x * s).toFixed(2)}px, ${(fy - FEET.y * s - layerShift).toFixed(2)}px, 0)`;
      bodyEl.style.transform = `scale(${s.toFixed(4)})`;
      setData(layerEl, "front", String(p.front));
      setData(actorEl, "holding", String(isHolding));
      if (bubbleEl.dataset.show === "true") {
        if (t > bubbleUntil) bubbleEl.dataset.show = "false";
        const bx = (rig.facingDir > 0 ? 214 : ART_W - 214) * s;
        bubbleAtEl.style.transform = `translate(${bx.toFixed(1)}px, ${(30 * s).toFixed(1)}px)`;
      }
      prev = { x, y: fy };
      rig.tick(dt, t);
    };

    // Interaction
    let clicks = 0;
    let clickedAt = 0;
    const onClick = () => {
      if (!rig || !L) return;
      const t = now();
      clicks = t - clickedAt < 0.7 ? clicks + 1 : 1;
      clickedAt = t;
      idleSince = t;
      const m = L.meta[Math.max(0, holding < 0 ? (current?.k ?? 0) : holding)];
      const tr = tricks(rig, m);
      let name: keyof typeof tr;
      if (holding < 0) name = pick(["hop", "woof", "love", "sneeze"] as const, lastTrick as never);
      else if (m.treadmill) name = pick(["woof", "hop", "love"] as const, lastTrick as never);
      else if (m.act === "basket") name = pick(["tilt", "love", "sneeze", "woof"] as const, lastTrick as never);
      else if (m.pose === "peek") name = pick(["peekaboo", "woof", "tilt", "sneeze"] as const, lastTrick as never);
      else
        name =
          clicks > 3 ? "love" : pick(["woof", "hop", "love", "tilt", "bow", "sneeze"] as const, lastTrick as never);
      lastTrick = name;
      rig.reset();
      script = tr[name](t);
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && rig && holding >= 0) {
        rig.petting(true);
        rig.wag(1);
      }
    };
    const onLeave = () => {
      if (!rig) return;
      rig.petting(false);
      if (holding >= 0) rig.wag(L?.meta[holding]?.act === "basket" ? 0.3 : 0.7);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "mouse") pointer = { x: e.clientX, y: e.clientY, t: now() };
    };
    const onCue = (e: Event) => {
      const d = (e as CustomEvent<{ look?: Element; say?: string; secs?: number }>).detail;
      const scene = holding >= 0 ? L?.meta[holding]?.scene : null;
      if (!scene || (d.look && !scene.contains(d.look))) return;
      const t = now();
      if (d.look) look = { el: d.look, until: t + (d.secs ?? 1.6) };
      if (d.say) say(d.say, t);
    };
    const onFocus = (e: FocusEvent) => {
      const el = e.target;
      if (el instanceof HTMLElement && el.matches("a, button, input, textarea, select, summary"))
        look = { el, until: now() + 1.4 };
    };

    const start = () => {
      if (running || reduce.matches) return;
      const layout = measure(probeEl);
      if (layout.stops.length < 2) return;
      L = layout;
      running = true;
      root.dataset.pup = layout.lane ? "lane" : "live";
      layerEl.hidden = false;
      const first = layout.meta[0];
      rig = new TeddyRig(svg, first.pose, first.facing);
      last = scrolledAt = now();
      lastScroll = scrollY;
      prev = null;
      laneFollow = null;
      snapped = false;
      const t = now();
      const at = locate(scrollY)!;
      if (at.k === 0 && at.t === 0 && first.act === "peekaboo") {
        // Hero intro: duck, pop up with a "peekaboo!", glance along the lineup, wag.
        holding = 0;
        heldSince = t;
        const friends = first.scene?.querySelectorAll("[data-pup-friend]") ?? [];
        const [one, end] = [friends[0], friends[friends.length - 1]];
        script = [
          ...tricks(rig, first).peekaboo(t + 0.1),
          [t + 1.5, (n) => one && (look = { el: one, until: n + 0.8 })],
          [t + 2.3, (n) => end && (look = { el: end, until: n + 0.8 })],
          [t + 3.1, () => ((look = null), rig!.wag(1))],
        ];
      } else holding = -1;
      addEventListener("pointermove", onPointer, { passive: true });
      addEventListener("pup:cue", onCue);
      addEventListener("focusin", onFocus);
      actorEl.addEventListener("click", onClick);
      actorEl.addEventListener("pointerenter", onEnter);
      actorEl.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      delete root.dataset.pup;
      layerEl.hidden = true;
      L?.meta.forEach((m) => {
        if (!m.scene) return;
        delete m.scene.dataset.here;
        delete m.scene.dataset.visited;
      });
      L = null;
      rig = null;
      holding = -1;
      removeEventListener("pointermove", onPointer);
      removeEventListener("pup:cue", onCue);
      removeEventListener("focusin", onFocus);
      actorEl.removeEventListener("click", onClick);
      actorEl.removeEventListener("pointerenter", onEnter);
      actorEl.removeEventListener("pointerleave", onLeave);
    };
    // Layout changed (images, fonts, resize): re-measure, and ease from where he was.
    const remeasure = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!running || !L) return;
        const next = measure(probeEl);
        if (next.stops.length < 2) return stop();
        const was = current;
        if (next.lane !== L.lane) holding = -1;
        L = next;
        root.dataset.pup = next.lane ? "lane" : "live";
        if (was) {
          const p = locate(scrollY)!;
          correction = { x: was.x - p.x, y: was.y - p.y, s: was.s - p.s };
        }
      }, 120);
    };

    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
    addEventListener("resize", remeasure);
    addEventListener("load", remeasure);
    const onMotionPref = () => (reduce.matches ? stop() : start());
    reduce.addEventListener("change", onMotionPref);
    start();
    document.fonts?.ready.then(remeasure);

    return () => {
      stop();
      clearTimeout(resizeTimer);
      ro.disconnect();
      removeEventListener("resize", remeasure);
      removeEventListener("load", remeasure);
      reduce.removeEventListener("change", onMotionPref);
    };
  }, []);

  return (
    <>
      <div ref={probe} aria-hidden="true" className="pup-probe" />
      <div ref={prints} aria-hidden="true" className="pup-prints">
        {Array.from({ length: 24 }, (_, i) => (
          <svg key={i} viewBox="0 0 64 64">
            <path d={PAW_PATH} />
          </svg>
        ))}
      </div>
      <div ref={layer} aria-hidden="true" className="pup-layer" hidden data-front="true">
        <div ref={actor} className="pup-actor">
          <div ref={body} className="pup-actor__body">
            <svg viewBox="0 0 300 240" style={{ overflow: "visible" }} focusable="false" aria-hidden="true">
              <TeddyArt p={TEDDY_POSES.peek} />
            </svg>
          </div>
          <span ref={bubbleAt} className="pup-bubble-at">
            <span ref={bubble} className="pup-bubble" data-show="false" />
          </span>
        </div>
      </div>
    </>
  );
}
