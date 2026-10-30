"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CurtainEdgeBottom, CurtainEdgeTop, Paw, Runner } from "@/components/art/chrome";
import { site } from "@/lib/site";

type State = "intro" | "idle" | "covering" | "covered" | "lifting";

const PRINTS = [
  { left: "18%", top: "6px", rotate: "14deg", delay: "0.16s" },
  { left: "27%", top: "-4px", rotate: "6deg", delay: "0.28s" },
  { left: "36%", top: "7px", rotate: "18deg", delay: "0.4s" },
  { left: "45%", top: "-3px", rotate: "4deg", delay: "0.52s" },
  { left: "54%", top: "6px", rotate: "16deg", delay: "0.64s" },
];

const COVER_MS = 300;
const LIFT_MS = 460;
const INTRO_MS = 1040;

/**
 * The blanket page transition: Teddy runs across while a quilt drops over the
 * page, the route changes underneath, then the quilt lifts. Internal link
 * clicks are intercepted at the document level so every <Link> gets it.
 */
export function Curtain() {
  const [state, setState] = useState<State>("intro");
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setState((s) => (s === "intro" ? "idle" : s)), INTRO_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onClick = (e: MouseEvent) => {
      if (reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      pending.current = url.pathname + url.search + url.hash;
      setState("covering");
      window.setTimeout(() => {
        setState("covered");
        router.push(pending.current!, { scroll: false });
      }, COVER_MS);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [router]);

  // Route committed underneath the blanket: lift it.
  useEffect(() => {
    if (!pending.current) return;
    pending.current = null;
    setState("lifting");
    const t = window.setTimeout(() => setState("idle"), LIFT_MS);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <div className="tp-curtain" data-state={state} aria-hidden="true">
      <div className="tp-curtain__blanket">
        <CurtainEdgeTop />
        <div className="tp-curtain__stage">
          <div className="tp-curtain__prints">
            {PRINTS.map(({ left, top, rotate, delay }) => (
              <Paw key={left} className="tp-curtain__print" style={{ left, top, rotate, animationDelay: delay }} />
            ))}
          </div>
          <div className="tp-curtain__runner">
            <Runner />
          </div>
          <p className="tp-curtain__note font-scrawl">{site.tagline}</p>
        </div>
        <CurtainEdgeBottom />
      </div>
    </div>
  );
}
