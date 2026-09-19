"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * `eager` swaps the scroll-triggered motion variant for the matching CSS
 * keyframes in globals.css. Same curve, same delays — but it runs off the
 * stylesheet, so above-the-fold copy is painted and animating before the JS
 * bundle has hydrated. Anything below the fold stays on `whileInView`.
 */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  eager = false,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  eager?: boolean;
}) {
  const reduced = useReducedMotion();

  if (eager) {
    return (
      <div
        className={className ? `u-rise ${className}` : "u-rise"}
        style={{ "--rise": `${y}px`, "--delay": `${delay}s` } as CSSProperties}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={reduced ? undefined : { opacity: 0, y }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -10% 0px" }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Word-by-word mask reveal for headlines. */
export function SplitText({
  text,
  className,
  delay = 0,
  as: Tag = "h2",
  eager = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
  eager?: boolean;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span
            key={`${w}-${i}`}
            className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]"
          >
            {eager ? (
              <span
                className="u-word"
                style={{ "--delay": `${delay + i * 0.055}s` } as CSSProperties}
              >
                {w}
                {/* A plain trailing space is trimmed at the end of an
                    inline-block; the headline needs the gap. */}
                {i < words.length - 1 ? "\u00A0" : ""}
              </span>
            ) : (
              <motion.span
                className="inline-block"
                initial={{ y: "110%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.9, delay: delay + i * 0.055, ease: EASE }}
              >
                {w}
                {i < words.length - 1 ? " " : ""}
              </motion.span>
            )}
          </span>
        ))}
      </span>
    </Tag>
  );
}
