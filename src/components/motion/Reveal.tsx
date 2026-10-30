"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Progressive reveal. Server HTML renders everything visible; once JS runs we
 * "arm" each [data-reveal] element (CSS hides armed-but-unrevealed ones) and
 * mark it [data-revealed] when it scrolls into view. Elements added later
 * (filters, client lists) are picked up by the MutationObserver.
 */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.revealed = "";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const arm = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])").forEach((el) => {
        // Armed by an earlier run of this effect (StrictMode, re-render) whose observer is gone: watch it again.
        if (el.dataset.armed !== undefined) return io.observe(el);
        const r = el.getBoundingClientRect();
        // Already on screen (or no motion wanted): show it as-is rather than hide-then-animate.
        if (reduce || (r.top < window.innerHeight && r.bottom > 0)) {
          el.dataset.revealed = "";
          return;
        }
        el.dataset.armed = "";
        io.observe(el);
      });
    };
    arm(document);

    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof Element && arm(n.parentNode ?? n));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
