"use client";

import { useEffect, useRef } from "react";
import { PAW_PATH } from "@/components/art/paths";

const STEP = 46; // px of pointer travel per print
const MAX = 14; // prints on screen at once
const LIFE = 1000; // ms; fully visible for the first 600

/**
 * The paw cursor leaves a fading trail of paw prints, alternating left/right
 * like real steps. Drawn on one fixed canvas; only runs for a fine mouse
 * pointer without reduced motion, and the rAF loop sleeps when no prints remain.
 */
export function PawTrail() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const paw = new Path2D(PAW_PATH);
    const prints: { x: number; y: number; angle: number; born: number }[] = [];
    let dpr = 1;
    let raf = 0;
    let drawing = false;
    let lx = NaN;
    let ly = NaN;
    let travelled = 0;
    let side = 1;

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      el.width = innerWidth * dpr;
      el.height = innerHeight * dpr;
    };
    const draw = (now: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
      for (let i = prints.length - 1; i >= 0; i--) {
        const p = prints[i];
        const age = now - p.born;
        if (age > LIFE) {
          prints.splice(i, 1);
          continue;
        }
        const fade = age < 600 ? 1 : 1 - (age - 600) / 400;
        ctx.globalAlpha = 0.42 * fade * fade;
        ctx.setTransform(0.27 * dpr, 0, 0, 0.27 * dpr, p.x * dpr, p.y * dpr);
        ctx.rotate(p.angle);
        ctx.translate(-32, -34);
        ctx.fillStyle = "#c2622b";
        ctx.fill(paw);
      }
      if (prints.length) raf = requestAnimationFrame(draw);
      else drawing = false;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (Number.isNaN(lx)) {
        lx = e.clientX;
        ly = e.clientY;
        return;
      }
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      travelled += Math.hypot(dx, dy);
      if (travelled >= STEP) {
        travelled = 0;
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        side = -side;
        const off = 7 * side;
        // Offset from the hotspot so prints trail behind the paw cursor graphic.
        prints.push({
          x: e.clientX + Math.cos(angle) * off + 14,
          y: e.clientY + Math.sin(angle) * off + 16,
          angle,
          born: performance.now(),
        });
        if (prints.length > MAX) prints.shift();
        if (!drawing) {
          drawing = true;
          raf = requestAnimationFrame(draw);
        }
      }
      lx = e.clientX;
      ly = e.clientY;
    };

    resize();
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("resize", resize);
    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] size-full" />;
}
