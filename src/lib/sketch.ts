/**
 * Hand-drawn frames for puppy cards. Everything is derived from a seed (the
 * puppy's slug), so the server and client draw the same wobbly outline and a
 * card always looks the same between visits.
 *
 * Shapes are drawn in a 0–100 box: a circle whose radius is nudged by three
 * low-frequency sine waves, then smoothed into cubic Béziers (Catmull-Rom).
 */

type Pt = [number, number];
export type DoodleKind = "sparkle" | "heart" | "dashes" | "swirl" | "dots" | "paw";
export type Doodle = { kind: DoodleKind; x: number; y: number; rot: number; size: number; ink: string };
export type Sketch = {
  mask: string;
  outline: string;
  retrace: string;
  wash: { d: string; dx: number; dy: number; color: string };
  tilt: number;
  doodles: Doodle[];
};

const WASHES = ["#f2be6b", "#f9cdbf", "#bfddf5", "#fbe3b4", "#e8c39a"];
const INKS = ["#c2622b", "#a24a1a", "#2a170e", "#d4893f"];
const DOODLES: DoodleKind[] = ["sparkle", "heart", "dashes", "swirl", "dots", "paw"];
const TAU = Math.PI * 2;

/** FNV-1a string hash feeding a mulberry32 generator: tiny, fast, deterministic. */
export function seeded(seed: string) {
  let h = 0x811c9dc5;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 0x1000193);
  let a = h >>> 0;
  return () => {
    let t = (a = (a + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

const f2 = (n: number) => n.toFixed(2);

/** Points on a wobbly circle (or an arc of one when `span` < 2π). */
function blob(rand: () => number, radius: number, wobble: number, count = 40, start = 0, span = TAU): Pt[] {
  const phase = [rand() * 6.28, rand() * 6.28, rand() * 6.28];
  const squash = 1 + (rand() - 0.5) * 0.05;
  const closed = span >= TAU;
  const pts: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const a = start + (i / (closed ? count : count - 1)) * span;
    const r =
      radius +
      wobble *
        (0.55 * Math.sin(2 * a + phase[0]) + 0.3 * Math.sin(3 * a + phase[1]) + 0.15 * Math.sin(5 * a + phase[2]));
    pts.push([50 + Math.cos(a) * r * squash, 50 + (Math.sin(a) * r) / squash]);
  }
  return pts;
}

/** Catmull-Rom through the points, written as cubic Bézier segments. */
function smooth(pts: Pt[], closed: boolean) {
  const n = pts.length;
  const at = (i: number) => pts[closed ? (i + n) % n : Math.min(n - 1, Math.max(0, i))];
  let d = `M${f2(pts[0][0])} ${f2(pts[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f2(c1[0])} ${f2(c1[1])} ${f2(c2[0])} ${f2(c2[1])} ${f2(p2[0])} ${f2(p2[1])}`;
  }
  return closed ? `${d}Z` : d;
}

export function sketchFor(seed: string): Sketch {
  const rand = seeded(seed);
  const mask = smooth(blob(rand, 45.5, 2.6), true);
  const outline = smooth(blob(rand, 47.8, 3.1), true);
  const retraceStart = rand() * TAU;
  const retrace = smooth(blob(rand, 49, 3.4, 30, retraceStart, Math.PI * (1.15 + 0.5 * rand())), false);
  const wash = {
    d: smooth(blob(rand, 46.5, 3.6), true),
    dx: (rand() - 0.5) * 9,
    dy: 3 + 4 * rand(),
    color: WASHES[Math.floor(rand() * WASHES.length)],
  };
  const tilt = (rand() - 0.5) * 5;

  // Doodles sit just outside the frame in up to three zones (in units of π radians), shuffled.
  const zones = (
    [
      [0.86, 1.08],
      [1.16, 1.42],
      [-0.08, 0.16],
    ] as const
  )
    .map((z) => ({ z, k: rand() }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.z);
  const count = 2 + Math.floor(2 * rand());
  const used = new Set<DoodleKind>();
  const doodles: Doodle[] = [];
  for (let i = 0; i < count; i++) {
    let kind = DOODLES[Math.floor(rand() * DOODLES.length)];
    if (used.has(kind)) kind = DOODLES.find((k) => !used.has(k))!;
    used.add(kind);
    const [lo, hi] = zones[i];
    const a = Math.PI * (lo + rand() * (hi - lo));
    const r = 55 + 4 * rand();
    doodles.push({
      kind,
      x: 50 + Math.cos(a) * r,
      y: 50 + Math.sin(a) * r,
      rot: (rand() - 0.5) * 50,
      size: 0.85 + 0.35 * rand(),
      ink: INKS[Math.floor(rand() * INKS.length)],
    });
  }
  return { mask, outline, retrace, wash, tilt, doodles };
}

/** A path as a CSS mask image (used to cut the photo to the wobbly shape). */
export function maskUrl(d: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${d}" fill="#000"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
