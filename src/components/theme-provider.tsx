"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { themeStore, type Theme } from "@/lib/theme-store";

type ThemeCtx = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const Ctx = createContext<ThemeCtx>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(Ctx);

/** Tiny WebAudio "pull-cord" click. No asset, no network. */
function clack(kind: "on" | "off") {
  try {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(kind === "on" ? 880 : 620, now);
    osc.frequency.exponentialRampToValueAtTime(kind === "on" ? 240 : 180, now + 0.07);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
    osc.onended = () => void ctx.close();
  } catch {
    /* audio is a nicety, never a requirement */
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.get,
    themeStore.getServer,
  );

  const setTheme = useCallback((next: Theme) => {
    if (next === themeStore.get()) return;
    clack(next === "light" ? "on" : "off");
    themeStore.set(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(themeStore.get() === "dark" ? "light" : "dark");
  }, [setTheme]);

  const value = useMemo(() => ({ theme, toggle, setTheme }), [theme, toggle, setTheme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Runs before paint so the first frame is never the wrong theme. */
export const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'dark';}catch(e){document.documentElement.dataset.theme='dark';}})();`;
