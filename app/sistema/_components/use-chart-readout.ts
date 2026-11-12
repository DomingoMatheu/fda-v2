"use client";

import { useState, type PointerEvent } from "react";

interface ChartReadout {
  active: string | null;
  show: (key: string) => void;
  hide: () => void;
  // Mouse leaving the chart clears the readout; a tap keeps it on screen.
  leave: (event: PointerEvent<SVGSVGElement>) => void;
}

// Which mark of a chart is under the pointer or has keyboard focus.
export function useChartReadout(): ChartReadout {
  const [active, setActive] = useState<string | null>(null);
  return {
    active,
    show: setActive,
    hide: () => setActive(null),
    leave: (event) => {
      if (event.pointerType === "mouse") setActive(null);
    },
  };
}
