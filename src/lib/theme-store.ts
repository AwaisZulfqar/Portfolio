export type Theme = "dark" | "light";

/**
 * Theme lives outside React so the first client render can read the value the
 * inline boot script already applied — no flash, no hydration mismatch.
 */
let current: Theme = "dark";
const listeners = new Set<() => void>();

if (typeof document !== "undefined") {
  const fromDom = document.documentElement.dataset.theme;
  current = fromDom === "light" ? "light" : "dark";
}

export const themeStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  get(): Theme {
    return current;
  },
  getServer(): Theme {
    return "dark";
  },
  set(next: Theme) {
    if (next === current) return;
    current = next;
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem("theme", next);
    } catch {
      /* private mode — the theme just won't persist */
    }
    listeners.forEach((fn) => fn());
  },
};
