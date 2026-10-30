"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Teddy } from "@/components/teddy/Teddy";
import { type Breed, FILTER_KEYS, filterPuppies, type Puppy, type PuppyFilters } from "@/lib/data";
import { whatsappHref } from "@/lib/site";
import { SketchCard } from "./SketchCard";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className="tp-sticker-chip">
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-scrawl mr-1 w-full shrink-0 text-cocoa-soft sm:w-28">{label}</span>
      {children}
    </div>
  );
}

/**
 * Sticker-chip filters over the puppy list. Filters live in the URL
 * (?origin=&breed=&gender=&collection=) so results are shareable; we update it
 * with history.replaceState, which Next keeps in sync with useSearchParams.
 */
export function PuppyBrowser({ puppies, breeds }: { puppies: Puppy[]; breeds: Breed[] }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const f: Required<PuppyFilters> = {
    origin: params.get("origin") ?? "",
    breed: params.get("breed") ?? "",
    gender: params.get("gender") ?? "",
    collection: params.get("collection") ?? "",
  };

  const toggle = (key: keyof PuppyFilters, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (f[key] === value) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  };
  const clear = () => window.history.replaceState(null, "", pathname);

  const shown = filterPuppies(puppies, f);
  const filtering = FILTER_KEYS.some((k) => f[k]);
  const breedsInStock = breeds.filter((b) => puppies.some((p) => p.breeds.includes(b.slug)));
  const hasLocal = puppies.some((p) => p.origin === "local");
  const hasKorean = puppies.some((p) => p.collections.includes("korean-teacup"));

  return (
    <div>
      <div role="group" aria-label="Filter puppies" className="tp-sketchpad flex flex-col gap-4">
        <Row label="where">
          <Chip active={!f.origin && !f.collection} onClick={clear}>
            Everywhere
          </Chip>
          {hasLocal && (
            <Chip active={f.origin === "local"} onClick={() => toggle("origin", "local")}>
              In Dubai
            </Chip>
          )}
          <Chip active={f.origin === "imported"} onClick={() => toggle("origin", "imported")}>
            Imported
          </Chip>
          {hasKorean && (
            <Chip active={f.collection === "korean-teacup"} onClick={() => toggle("collection", "korean-teacup")}>
              Korean Teacup
            </Chip>
          )}
        </Row>
        <Row label="breed">
          {breedsInStock.map((b) => (
            <Chip key={b.slug} active={f.breed === b.slug} onClick={() => toggle("breed", b.slug)}>
              {b.name}
            </Chip>
          ))}
        </Row>
        <Row label="boy or girl">
          <Chip active={f.gender === "male"} onClick={() => toggle("gender", "male")}>
            Boys
          </Chip>
          <Chip active={f.gender === "female"} onClick={() => toggle("gender", "female")}>
            Girls
          </Chip>
          {filtering && (
            <button type="button" onClick={clear} className="link-ink ml-auto text-[0.95rem] font-semibold">
              Clear filters
            </button>
          )}
        </Row>
      </div>

      <p className="font-scrawl mt-10 text-lg text-[var(--ink-soft)]" aria-live="polite">
        {shown.length === 1 ? "1 puppy" : `${shown.length} puppies`} {filtering ? "match" : "looking for a home"}
      </p>

      {shown.length ? (
        <ul className="tp-sketches mt-8">
          {shown.map((p, i) => (
            <li key={p.slug}>
              <SketchCard pup={p} index={i} priority={i < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="tp-sketchpad mt-10 grid items-center gap-6 md:grid-cols-[auto_1fr] md:gap-10">
          <Teddy pose="sit" className="mx-auto w-44 md:w-52" label="Teddy, tilting his head" />
          <div>
            <p className="font-plush text-big">No puppies match just now.</p>
            <p className="mt-3 max-w-[48ch] text-cocoa-soft">
              Tell us what you&apos;re hoping for and we&apos;ll let you know what&apos;s in our showroom or what we can
              bring in for you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                Ask on WhatsApp
              </a>
              <button type="button" onClick={clear} className="btn btn-ghost">
                Show all puppies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
