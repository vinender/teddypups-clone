"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const LenisContext = createContext<Lenis | null>(null);

/** The page's Lenis instance (null on touch / reduced-motion, where we use native scroll). */
export function useLenis() {
  return useContext(LenisContext);
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({ lerp: 0.12, wheelMultiplier: 0.85, anchors: { offset: -80 } });
    let raf = requestAnimationFrame(function loop(t) {
      instance.raf(t);
      raf = requestAnimationFrame(loop);
    });
    setLenis(instance);
    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  // New page: start at the top (or the hash target) without a smooth glide.
  useEffect(() => {
    if (!lenis) return;
    const target = window.location.hash ? document.querySelector(window.location.hash) : null;
    lenis.scrollTo((target as HTMLElement) ?? 0, { immediate: true, force: true, offset: -80 });
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
