"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { useMediaQuery } from "@/lib/use-media-query";
import { useSoftwareRenderer } from "@/lib/gpu";

type Variant = "fixed" | "inline";

/** three.js is ~0.9 MB — it never belongs in the first-load bundle. */
const LanyardCanvas = dynamic(() => import("./canvas"), { ssr: false });

/**
 * The hanging badge.
 *
 * `fixed`  — desktop: pinned to the right of the viewport, alongside the page.
 * `inline` — phones and small tablets: sits in the flow inside the hero, so the
 *            badge is still there to play with instead of vanishing.
 *
 * The canvas never takes pointer events; the scene raycasts the window itself,
 * so nothing underneath becomes unclickable. The shell reserves its own height,
 * so the canvas arriving late shifts nothing.
 */
export function Lanyard({ variant = "fixed" }: { variant?: Variant }) {
  const { theme, toggle } = useTheme();
  const [armed, setArmed] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const wide = useMediaQuery("(min-width: 1024px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  const [shell, setShell] = useState<HTMLDivElement | null>(null);
  const [near, setNear] = useState(false);
  const [running, setRunning] = useState(true);
  // Without a GPU every frame of this canvas is rasterised on the main thread.
  // No amount of tuning (resolution, MSAA, frame rate) brings that under
  // control, so those machines get the page without the badge — the same call
  // `prefers-reduced-motion` already makes. The shell keeps its box either way,
  // so nothing around it moves.
  const soft = useSoftwareRenderer();

  const onArmed = useCallback((a: boolean) => setArmed(a), []);
  const onGrab = useCallback((g: boolean) => setGrabbing(g), []);

  // Load — and afterwards draw — only while the badge is somewhere near the
  // viewport, and never while the tab is in the background.
  useEffect(() => {
    const el = shell;
    if (!el) return;

    if (soft) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setRunning(visible);
        if (visible) setNear(true);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);

    const onVisibility = () => {
      if (document.hidden) setRunning(false);
      else setRunning(el.getBoundingClientRect().top < window.innerHeight + 200);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [shell, soft]);

  if (reduced) return null;
  if (variant === "fixed" && !wide) return null;
  if (variant === "inline" && wide) return null;

  const shellClass =
    variant === "fixed"
      ? "pointer-events-none fixed top-0 right-0 z-40 h-screen"
      : "pointer-events-none relative z-10 mt-12 h-[min(62svh,460px)] w-full";

  return (
    <div
      aria-hidden
      ref={setShell}
      className={shellClass}
      style={variant === "fixed" ? { width: "var(--badge-col)" } : undefined}
    >
      {/* Holds the canvas's box whether or not it has loaded, so the caption
          below never jumps when the chunk lands. */}
      <div className="size-full">
        {near && !soft && (
          <LanyardCanvas
            theme={theme}
            wide={wide}
            running={running}
            onToggle={toggle}
            onArmed={onArmed}
            onGrab={onGrab}
          />
        )}
      </div>

      <div
        className={
          variant === "fixed"
            ? "absolute inset-x-0 bottom-8 flex justify-center px-6"
            : "mt-2 flex justify-center px-4"
        }
        hidden={soft}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={armed ? "armed" : grabbing ? "grab" : "idle"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="u-label flex items-center gap-2 rounded-full border px-4 py-2 text-center"
            style={{
              background: "var(--surface)",
              borderColor: armed ? "var(--accent)" : "var(--line)",
              color: armed ? "var(--accent)" : "var(--muted)",
            }}
          >
            <span
              className="relative inline-block size-1.5 shrink-0 rounded-full"
              style={{ background: armed ? "var(--accent)" : "var(--line-strong)" }}
            />
            {armed
              ? `Release — lights ${theme === "dark" ? "on" : "off"}`
              : grabbing
                ? "Pull it further down"
                : "Drag the badge · pull down to switch"}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
