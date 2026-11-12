"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

interface ElementWidth<T extends HTMLElement> {
  ref: RefObject<T | null>;
  width: number;
}

// Width of an element in pixels, kept up to date as it resizes. Starts at
// `fallback` so the server and the first client render agree.
export function useElementWidth<T extends HTMLElement>(
  fallback: number,
): ElementWidth<T> {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
