/**
 * Teddy's skeleton. A pose is a handful of numbers (body/head offsets and
 * rotations, leg angles, which eyes show…). `partTransforms` turns a pose plus
 * live motion (walk phase, stride, tail wag, blink, gaze) into SVG transform /
 * opacity values for the named parts of <TeddyArt> (`data-p="head"`, …).
 * `TeddyRig` eases between poses every frame and writes only changed attributes.
 */

export const ART_W = 300;
export const ART_H = 240;
/** Ground contact point (centre of the shadow) in art coordinates. */
export const FEET = { x: 150, y: 228 };
/** Head centre, used as the gaze origin and for speech-bubble placement. */
export const HEAD = [212, 100] as const;
export const EYE_Y = 98;

// Pivots for each part.
const BODY = [196, 206] as const;
const SHOULDER_NEAR = [186, 194] as const;
const SHOULDER_FAR = [168, 192] as const;
const HIP_NEAR = [110, 194] as const;
const HIP_FAR = [94, 192] as const;
export const TAIL = [84, 150] as const;
const EAR_L = [174, 82] as const;
const EAR_R = [250, 82] as const;

export type Pose = {
  bodyRot: number;
  bodyX: number;
  bodyY: number;
  stretch: number;
  headX: number;
  headY: number;
  headRot: number;
  earL: number;
  earR: number;
  tail: number;
  fn: number;
  ff: number;
  bn: number;
  bf: number;
  sit: number;
  eyes: number;
  happy: number;
  tongue: number;
  mouth: number;
  front: number;
};

const NEUTRAL: Pose = {
  bodyRot: 0,
  bodyX: 0,
  bodyY: 0,
  stretch: 1,
  headX: 0,
  headY: 0,
  headRot: 0,
  earL: 0,
  earR: 0,
  tail: 0,
  fn: 0,
  ff: 0,
  bn: 0,
  bf: 0,
  sit: 0,
  eyes: 1,
  happy: 0,
  tongue: 0,
  mouth: 0,
  front: 0,
};

export const POSES = {
  stand: NEUTRAL,
  walk: { ...NEUTRAL, tail: -6, tongue: 1 },
  sit: { ...NEUTRAL, bodyRot: -24, bodyY: -2, headX: -10, headY: -6, tail: 34, sit: 1, tongue: 1 },
  peek: { ...NEUTRAL, headY: 4, earL: -6, earR: 6, tail: -20, front: 1, tongue: 1 },
  snug: { ...NEUTRAL, headY: 9, headRot: 4, earL: 3, earR: -3, tail: -20, front: 1 },
  hop: {
    ...NEUTRAL,
    bodyRot: -9,
    stretch: 1.06,
    headY: -6,
    fn: -42,
    ff: -32,
    bn: 40,
    bf: 30,
    earL: -26,
    earR: 26,
    tail: -24,
    tongue: 1,
  },
  sniff: { ...NEUTRAL, bodyRot: 7, headX: 16, headY: 32, headRot: 9, tail: -14, fn: 6, ff: 4 },
  bow: { ...NEUTRAL, bodyRot: 15, bodyY: 2, headX: 14, headY: 30, fn: -58, ff: -52, tail: -32, happy: 1, tongue: 1 },
  beg: {
    ...NEUTRAL,
    bodyRot: -36,
    bodyY: -6,
    headX: -18,
    headY: -18,
    sit: 1,
    fn: -70,
    ff: -64,
    tail: 30,
    happy: 1,
    tongue: 1,
  },
} satisfies Record<string, Pose>;
export type PoseName = keyof typeof POSES;

/** Motion state that isn't part of a pose. */
export type Motion = {
  phase: number; // walk cycle angle
  stride: number; // 0 standing … 1 full walk
  time: number;
  wag: number; // 0 lazy … 1 happy tail
  gazeX: number;
  gazeY: number;
  blink: number; // 0 open … 1 shut
  ear: number; // floppy ear offset (spring)
};

const STILL: Motion = { phase: 0, stride: 0, time: 0, wag: 0, gazeX: 0, gazeY: 0, blink: 0, ear: 0 };
const r2 = (n: number) => Math.round(n * 100) / 100;
const rot = (deg: number, [x, y]: readonly [number, number]) => `rotate(${r2(deg)} ${x} ${y})`;
const clamp = (n: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, n));
/** Fraction to move toward a target this frame for a time constant `tau`. */
const ease = (dt: number, tau: number) => 1 - Math.exp(-dt / tau);

function mixPose(a: Pose, b: Pose, t: number): Pose {
  const out = { ...a };
  for (const k of Object.keys(NEUTRAL) as (keyof Pose)[]) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

export function partTransforms(p: Pose, m: Motion = STILL) {
  const near = Math.sin(m.phase);
  const far = Math.sin(m.phase + Math.PI);
  const swing = 20 + 10 * m.stride;
  const bob = (1 - Math.cos(2 * m.phase)) / 2;
  const walking = m.stride > 0.01 ? 1 : 0;
  const breathe = Math.sin(2.4 * m.time) * (1 - walking);
  const bodyY = p.bodyY - bob * (2.5 + 4 * m.stride) * walking + 0.6 * breathe;
  const bodyRot = p.bodyRot + 1.6 * Math.sin(m.phase) * walking;
  const legComp = -p.bodyRot; // front legs stay vertical when the body tilts
  const wagAmp = 5 + 17 * m.wag;
  const wagHz = 1.2 + 2.6 * m.wag;
  const tail = p.tail + Math.sin(m.time * wagHz * Math.PI * 2) * wagAmp;
  const headBob = (-(1 - Math.cos(2 * m.phase - 0.7)) / 2) * (2 + 3 * m.stride) * walking + 0.9 * breathe;

  return {
    body: `translate(${r2(p.bodyX)} ${r2(bodyY)}) ${rot(bodyRot, BODY)} translate(${BODY[0]} 0) scale(${r2(p.stretch)} 1) translate(${-BODY[0]} 0)`,
    fn: `translate(${SHOULDER_NEAR[0]} ${SHOULDER_NEAR[1]}) rotate(${r2(p.fn + legComp + near * swing * walking)})`,
    ff: `translate(${SHOULDER_FAR[0]} ${SHOULDER_FAR[1]}) rotate(${r2(p.ff + legComp + far * swing * walking)})`,
    bn: `translate(${HIP_NEAR[0]} ${HIP_NEAR[1]}) rotate(${r2(p.bn + far * swing * walking)})`,
    bf: `translate(${HIP_FAR[0]} ${HIP_FAR[1]}) rotate(${r2(p.bf + near * swing * walking)})`,
    tail: rot(tail, TAIL),
    haunch: `translate(0 ${r2(-(0.06 * p.bodyRot))})`,
    head: `translate(${r2(p.headX)} ${r2(p.headY + headBob)}) ${rot(p.headRot + 1.4 * Math.sin(m.phase) * walking, HEAD)}`,
    earL: rot(p.earL + m.ear + 4 * Math.sin(2 * m.phase) * walking, EAR_L),
    earR: rot(p.earR - m.ear - 4 * Math.sin(2 * m.phase) * walking, EAR_R),
    eyes: `translate(${r2(3.4 * m.gazeX)} ${r2(2.6 * m.gazeY)})`,
    blink: `translate(0 ${r2(EYE_Y * m.blink * 0.92)}) scale(1 ${r2(1 - 0.92 * m.blink)})`,
    openEyes: r2(Math.max(0, p.eyes - p.happy)),
    happyEyes: r2(Math.min(p.happy, p.eyes)),
    shutEyes: r2(1 - p.eyes),
    tongue: r2(p.tongue * (1 - p.mouth)),
    mouth: r2(p.mouth),
    backLegs: r2(1 - p.sit),
    haunchOpacity: r2(p.sit * (1 - p.front)),
    side: r2(1 - p.front),
    ledge: r2(p.front),
    shadow: `translate(${r2(0.6 * p.bodyX)} 0) scale(${r2(1 - 0.05 * bob * walking)} 1)`,
    shadowOpacity: r2(0.12 * (1 - p.front)),
  };
}

type Out = ReturnType<typeof partTransforms>;
/** [part, attribute, key in partTransforms output] */
const WRITES: [string, string, keyof Out | "root"][] = [
  ["root", "transform", "root"],
  ["shadow", "transform", "shadow"],
  ["shadow", "opacity", "shadowOpacity"],
  ["body", "transform", "body"],
  ["body", "opacity", "side"],
  ["bf", "transform", "bf"],
  ["bf", "opacity", "backLegs"],
  ["bn", "transform", "bn"],
  ["bn", "opacity", "backLegs"],
  ["ff", "transform", "ff"],
  ["fn", "transform", "fn"],
  ["tail", "transform", "tail"],
  ["haunch", "transform", "haunch"],
  ["haunch", "opacity", "haunchOpacity"],
  ["head", "transform", "head"],
  ["earL", "transform", "earL"],
  ["earR", "transform", "earR"],
  ["eyes", "transform", "eyes"],
  ["open", "opacity", "openEyes"],
  ["blink", "transform", "blink"],
  ["happy", "opacity", "happyEyes"],
  ["shut", "opacity", "shutEyes"],
  ["tongue", "opacity", "tongue"],
  ["mouth", "opacity", "mouth"],
  ["ledge", "opacity", "ledge"],
];

/** Drives one Teddy SVG: call the setters whenever, and `tick` once per frame. */
export class TeddyRig {
  private els = new Map<string, Element>();
  private written = new Map<string, string>();
  private pose: Pose;
  private target: Pose;
  private m: Motion = { ...STILL };
  private facing: number;
  private facingTarget: number;
  private turn = 0.07;
  private strideTarget = 0;
  private wagTarget = 0.35;
  private gazeTarget = { x: 0, y: 0 };
  private tilt = 0;
  private tiltTarget = 0;
  private earV = 0;
  private nextBlink = 1.2;
  private blinkAt = -1;
  private mouthUntil = 0;
  private bounce = 0;
  private bounceV = 0;
  private pet = 0;
  private petTarget = 0;

  constructor(
    private svg: SVGSVGElement,
    pose: PoseName | Pose = "sit",
    facing = 1,
  ) {
    svg.querySelectorAll<SVGElement>("[data-p]").forEach((el) => this.els.set(el.dataset.p!, el));
    this.pose = { ...(typeof pose === "string" ? POSES[pose] : pose) };
    this.target = this.pose;
    this.facing = this.facingTarget = facing;
  }

  setPose(p: PoseName | Pose) {
    this.target = typeof p === "string" ? POSES[p] : p;
  }
  /** Turn to face 1 (right) or -1 (left); `tau` is how quickly. */
  face(dir: number, tau = 0.07) {
    this.facingTarget = dir;
    this.turn = tau;
  }
  get facingDir() {
    return this.facingTarget;
  }
  stride(s: number) {
    this.strideTarget = clamp(s, 0, 1);
  }
  /** Sync the leg cycle to a distance travelled (in art units), so feet don't slide. */
  walkedTo(distance: number) {
    this.m.phase = (distance / 46) * Math.PI;
  }
  wag(w: number) {
    this.wagTarget = clamp(w, 0, 1);
  }
  cock(deg: number) {
    this.tiltTarget = deg;
  }
  /** Look toward a viewport point, or straight ahead with null. */
  lookAt(pt: { x: number; y: number } | null) {
    if (!pt) {
      this.gazeTarget = { x: 0, y: 0 };
      return;
    }
    const box = this.svg.getBoundingClientRect();
    const hx = this.facingTarget > 0 ? HEAD[0] : ART_W - HEAD[0];
    const dx = pt.x - (box.left + (hx / ART_W) * box.width);
    const dy = pt.y - (box.top + (EYE_Y / ART_H) * box.height);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 160);
    this.gazeTarget = { x: (dx / d) * k * this.facingTarget, y: (dy / d) * k };
  }
  woof(now: number) {
    this.mouthUntil = now + 0.34;
    this.bounceV = -150;
    this.earV += 260;
  }
  jolt(k = 1) {
    this.earV += 220 * k;
  }
  hop(k = 1) {
    this.bounceV = -230 * k;
    this.earV += 200 * k;
  }
  yawn(now: number, secs = 0.9) {
    this.mouthUntil = now + secs;
  }
  petting(on: boolean) {
    this.petTarget = on ? 1 : 0;
  }
  reset() {
    this.tiltTarget = 0;
    this.petTarget = 0;
  }

  tick(dt: number, now: number) {
    dt = Math.min(dt, 0.05);
    const m = this.m;
    m.time = now;
    this.pose = mixPose(this.pose, this.target, ease(dt, 0.16));
    this.facing += (this.facingTarget - this.facing) * ease(dt, this.turn);
    m.stride += (this.strideTarget - m.stride) * ease(dt, 0.12);
    if (m.stride < 0.012 && this.strideTarget === 0) m.stride = 0;
    m.wag += (this.wagTarget - m.wag) * ease(dt, 0.4);
    m.gazeX += (this.gazeTarget.x - m.gazeX) * ease(dt, 0.07);
    m.gazeY += (this.gazeTarget.y - m.gazeY) * ease(dt, 0.07);
    this.tilt += (this.tiltTarget + 3 * m.gazeX - this.tilt) * ease(dt, 0.18);
    // Springs: floppy ears and the hop bounce.
    this.earV += (-150 * m.ear - 10 * this.earV) * dt;
    m.ear = clamp(m.ear + this.earV * dt, -28, 28);
    this.bounceV += (-260 * this.bounce - 16 * this.bounceV) * dt;
    this.bounce += this.bounceV * dt;
    this.pet += (this.petTarget - this.pet) * ease(dt, 0.15);

    // Blink every few seconds, sometimes twice in a row.
    if (now > this.nextBlink && this.pose.eyes > 0.6) {
      this.blinkAt = now;
      this.nextBlink = now + 2.2 + 3.8 * Math.random();
      if (Math.random() < 0.18) this.nextBlink = now + 0.32;
    }
    const b = (now - this.blinkAt) / 0.15;
    m.blink = b >= 0 && b <= 1 ? Math.sin(b * Math.PI) : 0;

    const out = partTransforms(
      {
        ...this.pose,
        headRot: this.pose.headRot + this.tilt,
        bodyY: this.pose.bodyY + this.bounce,
        headY: this.pose.headY + 1.15 * this.bounce,
        mouth: now < this.mouthUntil ? 1 : this.pose.mouth,
        happy: Math.max(this.pose.happy, this.pet),
      },
      m,
    );
    // Facing is a horizontal squash through zero so turning reads as a flip.
    const f = Math.abs(this.facing) < 0.02 ? 0.02 * Math.sign(this.facing || 1) : this.facing;
    const root = `translate(${ART_W / 2} 0) scale(${f.toFixed(3)} 1) translate(${-ART_W / 2} 0)`;
    for (const [part, attr, key] of WRITES) {
      const el = this.els.get(part);
      if (!el) continue;
      const v = key === "root" ? root : String(out[key]);
      const id = `${part}:${attr}`;
      if (this.written.get(id) !== v) {
        el.setAttribute(attr, v);
        this.written.set(id, v);
      }
    }
  }
}
