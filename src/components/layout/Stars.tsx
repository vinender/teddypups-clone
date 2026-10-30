const STAR = "M20 3c1.6 9.4 7.6 15.4 17 17-9.4 1.6-15.4 7.6-17 17-1.6-9.4-7.6-15.4-17-17 9.4-1.6 15.4-7.6 17-17z";

/** [left %, top %, base size px]; sizes are multiplied by `scale`. */
export type StarSpec = readonly [number, number, number];

export const FOOTER_STARS: StarSpec[] = [
  [6, 18, 9],
  [14, 42, 6],
  [23, 12, 7],
  [31, 30, 5],
  [44, 9, 8],
  [52, 36, 5.5],
  [63, 15, 7.5],
  [71, 40, 5],
  [92, 33, 6],
];

export const NIGHT_STARS: StarSpec[] = [
  [8, 12, 9],
  [22, 30, 5],
  [41, 8, 7],
  [57, 22, 4.5],
  [72, 6, 8],
  [88, 18, 6],
  [95, 42, 5],
  [4, 58, 6],
  [34, 70, 4],
  [63, 84, 5.5],
  [83, 66, 7],
];

/** Twinkling four-point stars, staggered 0.4s apart. */
export function Stars({
  stars,
  scale = 1.4,
  className = "pointer-events-none absolute inset-0",
}: {
  stars: StarSpec[];
  scale?: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={className}>
      {stars.map(([left, top, size], i) => (
        <svg
          key={i}
          viewBox="0 0 40 40"
          className="tp-twinkle absolute text-honey"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size * scale}px`,
            animationDelay: `${(i * 0.4).toFixed(2)}s`,
          }}
        >
          <path d={STAR} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
