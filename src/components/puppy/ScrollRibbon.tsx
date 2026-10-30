"use client";

import { useEffect, useRef } from "react";

/** A bookmark ribbon down the page edge that fills as you read. */
export function ScrollRibbon() {
  const band = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (band.current) band.current.style.transform = `scaleY(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="tp-ribbon">
      <div className="tp-ribbon__track">
        <span ref={band} className="tp-ribbon__band" style={{ transform: "scaleY(0)" }} />
      </div>
    </div>
  );
}
