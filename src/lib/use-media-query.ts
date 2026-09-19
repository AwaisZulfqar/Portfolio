"use client";

import { useCallback, useSyncExternalStore } from "react";

/** SSR-safe media query — returns `false` on the server. */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (fn: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", fn);
      return () => mql.removeEventListener("change", fn);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
