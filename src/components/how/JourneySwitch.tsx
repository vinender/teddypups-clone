"use client";

import { useEffect, useRef, useState } from "react";

type Way = { id: string; label: string; hint: string; panel: React.ReactNode };

/**
 * "Two ways home" as an accessible tab switch: a sliding thumb (CSS reads --at),
 * arrow-key navigation, and only the selected panel shown. data-ready lets the
 * step cards animate in once hydrated.
 */
export function JourneySwitch({ ways, teddy }: { ways: Way[]; teddy: React.ReactNode }) {
  const [at, setAt] = useState(0);
  const root = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // Hydrated: let the step cards animate in (without JS they simply show).
  useEffect(() => {
    if (root.current) root.current.dataset.ready = "";
  }, []);

  const select = (i: number, focus = false) => {
    const n = (i + ways.length) % ways.length;
    setAt(n);
    if (focus) tabs.current[n]?.focus();
  };

  return (
    <section ref={root} className="tp-journeys" aria-labelledby="two-ways-title">
      <div className="tp-journeys__top">
        <div>
          <p className="font-scrawl tp-journeys__kicker">choose your way</p>
          <h2 id="two-ways-title" className="font-plush text-big">
            Two ways home
          </h2>
        </div>
        <div className="tp-journeys__pick">
          <div
            role="tablist"
            aria-label="Ways to bring your puppy home"
            className="tp-switch"
            style={{ "--at": at, "--n": ways.length } as React.CSSProperties}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") select(at + 1, true);
              if (e.key === "ArrowLeft") select(at - 1, true);
            }}
          >
            <span aria-hidden="true" className="tp-switch__thumb" />
            {ways.map((w, i) => (
              <button
                key={w.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${w.id}`}
                aria-selected={i === at}
                aria-controls={`panel-${w.id}`}
                tabIndex={i === at ? 0 : -1}
                className="tp-switch__tab"
                onClick={() => select(i)}
              >
                <span className="font-plush tp-switch__label">{w.label}</span>
                <span className="tp-switch__hint">{w.hint}</span>
              </button>
            ))}
          </div>
          {teddy}
        </div>
      </div>
      {ways.map((w, i) => (
        <div
          key={w.id}
          role="tabpanel"
          id={`panel-${w.id}`}
          aria-labelledby={`tab-${w.id}`}
          className="tp-journey"
          hidden={i !== at}
        >
          {w.panel}
        </div>
      ))}
    </section>
  );
}
