import type { Step } from "@/lib/data";

/** Numbered paw-trail of steps used on puppy pages and How it works. */
export function HomeTrail({
  steps,
  className = "tp-trail tp-trail--row tp-trail--paws mt-10",
}: {
  steps: Step[];
  className?: string;
}) {
  return (
    <ol className={className}>
      {steps.map((s, i) => (
        <li key={s.title}>
          <span aria-hidden="true" className="tp-trail__num font-plush">
            {i + 1}
          </span>
          <h3 className="font-plush-text text-xl font-bold leading-tight">{s.title}</h3>
          <p className="mt-2 max-w-[38ch] text-cocoa-soft">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
