"use client";

import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { useMediaQuery } from "@/lib/use-media-query";
import { LanyardScene } from "./scene";

type Variant = "fixed" | "inline";

/**
 * The hanging badge.
 *
 * `fixed`  — desktop: pinned to the right of the viewport, alongside the page.
 * `inline` — phones and small tablets: sits in the flow inside the hero, so the
 *            badge is still there to play with instead of vanishing.
 *
 * The canvas never takes pointer events; the scene raycasts the window itself,
 * so nothing underneath becomes unclickable.
 */
export function Lanyard({ variant = "fixed" }: { variant?: Variant }) {
  const { theme, toggle } = useTheme();
  const [armed, setArmed] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const wide = useMediaQuery("(min-width: 1024px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  const onArmed = useCallback((a: boolean) => setArmed(a), []);
  const onGrab = useCallback((g: boolean) => setGrabbing(g), []);

  if (reduced) return null;
  if (variant === "fixed" && !wide) return null;
  if (variant === "inline" && wide) return null;

  const shell =
    variant === "fixed"
      ? "pointer-events-none fixed top-0 right-0 z-40 h-screen"
      : "pointer-events-none relative z-10 mt-12 h-[min(62svh,460px)] w-full";

  return (
    <div
      aria-hidden
      className={shell}
      style={variant === "fixed" ? { width: "var(--badge-col)" } : undefined}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, -0.3, 11.2], fov: 30 }}
        style={{ pointerEvents: "none" }}
      >
        <LanyardScene theme={theme} onToggle={toggle} onArmed={onArmed} onGrab={onGrab} />
      </Canvas>

      <div
        className={
          variant === "fixed"
            ? "absolute inset-x-0 bottom-8 flex justify-center px-6"
            : "mt-2 flex justify-center px-4"
        }
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
