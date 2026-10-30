"use client";

import { useEffect, useId, useRef } from "react";

/**
 * A plane flying Korea → Dubai as you scroll: progress runs from the moment the
 * figure's top reaches 95% of the viewport until its bottom reaches 25%. The
 * plane follows the dashed route (getPointAtLength) and banks along its tangent.
 * Optionally a puppy looks out of the porthole.
 */
export function Flight({ photo, label }: { photo?: string; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const route = useRef<SVGPathElement>(null);
  const plane = useRef<SVGGElement>(null);
  const clip = useId();

  useEffect(() => {
    const el = box.current;
    const path = route.current;
    const g = plane.current;
    if (!el || !path || !g) return;
    const len = path.getTotalLength();
    const draw = (p: number) => {
      const at = Math.min(len, Math.max(0, p * len));
      const pt = path.getPointAtLength(at);
      const ahead = path.getPointAtLength(Math.min(len, at + 1));
      const behind = path.getPointAtLength(Math.max(0, at - 1));
      const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
      g.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${angle.toFixed(1)})`);
      g.style.opacity = String(Math.min(1, Math.max(0, (p - 0.11) / 0.06)));
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return draw(0.62);

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const start = innerHeight * 0.95; // top hits 95%
      const end = innerHeight * 0.25 - r.height; // bottom hits 25%
      draw(Math.min(1, Math.max(0, (start - r.top) / (start - end))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={box} className="tp-flight">
      <svg viewBox="0 0 660 300" role="img" aria-label={label}>
        <defs>
          <clipPath id={clip}>
            <circle r="25" />
          </clipPath>
        </defs>
        <path ref={route} d="M40 250 C 170 40, 470 20, 620 168" className="tp-flight__route" />
        <circle cx="40" cy="250" r="7" className="tp-flight__dot" />
        <circle cx="620" cy="168" r="7" className="tp-flight__dot" />
        <text x="40" y="284" textAnchor="middle" className="tp-flight__label">
          Korea
        </text>
        <text x="620" y="202" textAnchor="middle" className="tp-flight__label">
          Dubai
        </text>
        <g ref={plane} transform="translate(410 70)">
          <g transform="translate(-126 -78)">
            <path d="M28 60 L8 26 L34 26 L60 54 Z" className="tp-flight__wing" />
            <path d="M108 112 L142 156 L172 156 L158 112 Z" className="tp-flight__wing tp-flight__wing--far" />
            <path
              d="M20 80 C20 52 52 44 80 44 L168 44 C200 44 224 60 232 80 C224 100 200 112 168 112 L80 112 C52 112 20 104 20 80 Z"
              className="tp-flight__body"
            />
            <path d="M104 44 L138 2 L168 2 L154 44 Z" className="tp-flight__wing" />
            <path d="M206 64 C215 67 221 73 224 80" className="tp-flight__line" />
          </g>
          {photo && (
            <g transform="translate(10 2)">
              <image
                href={photo}
                x="-25"
                y="-25"
                width="50"
                height="50"
                clipPath={`url(#${clip})`}
                preserveAspectRatio="xMidYMid slice"
              />
              <circle r="25" className="tp-flight__porthole" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
