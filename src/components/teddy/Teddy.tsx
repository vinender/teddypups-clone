import { TeddyArt } from "./TeddyArt";
import { TEDDY_POSES, type TeddyPose } from "./teddy-poses";

type TeddyProps = {
  pose?: TeddyPose;
  /** Accessible name; omit for purely decorative appearances. */
  label?: string;
  facing?: "left" | "right";
  className?: string;
};

/** Teddy, the TeddyPups mascot, drawn in one of his poses. */
export function Teddy({ pose = "sit", label, facing = "right", className = "" }: TeddyProps) {
  return (
    <div className={`pup-buddy ${className}`} data-facing={facing} data-pose={pose}>
      <svg
        viewBox="0 0 300 240"
        style={{ overflow: "visible" }}
        focusable="false"
        {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      >
        <TeddyArt p={TEDDY_POSES[pose]} />
      </svg>
      <span aria-hidden="true" className="pup-bubble" data-show="false" />
    </div>
  );
}

type StopProps = TeddyProps & {
  /** Scene-specific behaviour hook used by CSS (peekaboo, tilt, basket). */
  act?: string;
  behind?: boolean;
  lane?: boolean;
};

/** A spot in a scene where Teddy sits; scenes position it with their own class. */
export function PupStop({ act, behind, lane, className = "", ...teddy }: StopProps) {
  return (
    <div
      data-pup-stop="true"
      data-pose={teddy.pose ?? "sit"}
      data-facing={teddy.facing ?? "right"}
      data-act={act}
      data-behind={behind || undefined}
      data-lane={lane || undefined}
      className={`pup-stop ${className}`}
    >
      <Teddy {...teddy} />
    </div>
  );
}
