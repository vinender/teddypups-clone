"use client";

import { usePathname } from "next/navigation";
import { PupJourney } from "./PupJourney";

/** A fresh journey per page: stops are re-measured from the new page's scenes. */
export function PupJourneyHost() {
  const pathname = usePathname();
  return <PupJourney key={pathname} />;
}
