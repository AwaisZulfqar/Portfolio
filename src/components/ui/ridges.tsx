"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { CSSProperties } from "react";

/**
 * Layered mountain backdrop.
 *
 * Each ridge line is generated once at module load from a seeded PRNG, so the
 * skyline is identical on server and client, then smoothed with Catmull-Rom
 * curves. Low tension keeps the summits pointed instead of wave-like.
 * Layers drift at different rates on scroll and sway slowly forever.
 */

const VB_W = 1440;
const VB_H = 540;

type LayerSpec = {
  seed: number;
  /** Number of summits across the width. Fewer = broader mountains. */
  peaks: number;
  /** Vertical band the summits live in (smaller y = higher peak). */
  high: number;
  low: number;
  /** 0 = razor sharp, 1 = rolling hills. */
  tension: number;
  travel: number;
  sway: number;
  period: number;
  opacity: number;
  from: string;
  to: string;
  crest: number;
};

const SPECS: LayerSpec[] = [
  {
    seed: 9137,
    peaks: 9,
    high: 148,
    low: 292,
    tension: 0.4,
    travel: -48,
    sway: 14,
    period: 38,
    opacity: 0.16,
    from: "var(--sky)",
    to: "var(--sky)",
    crest: 0.08,
  },
  {
    seed: 4421,
    peaks: 8,
    high: 236,
    low: 358,
    tension: 0.46,
    travel: -108,
    sway: -22,
    period: 29,
    opacity: 0.2,
    from: "var(--sky)",
    to: "var(--accent)",
    crest: 0.1,
  },
  {
    seed: 7703,
    peaks: 7,
    high: 322,
    low: 424,
    tension: 0.52,
    travel: -186,
    sway: 30,
    period: 22,
    opacity: 0.26,
    from: "var(--accent)",
    to: "var(--accent)",
    crest: 0.14,
  },
  {
    seed: 2286,
    peaks: 6,
    high: 416,
    low: 486,
    tension: 0.6,
    travel: -288,
    sway: -40,
    period: 17,
    opacity: 0.62,
    from: "var(--bg-elev)",
    to: "var(--bg-elev)",
    crest: 0.26,
  },
];

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Summit / saddle alternation, smoothed into a closed silhouette. */
function ridgePath({ seed, peaks, high, low, tension }: LayerSpec) {
  const rnd = mulberry(seed);
  const pts: [number, number][] = [];
  const steps = peaks * 2;
  const span = VB_W / steps;

  for (let i = 0; i <= steps + 1; i++) {
    // Nudge each node sideways so summits are not evenly spaced.
    const x = -span + i * span + (rnd() - 0.5) * span * 0.7;
    const summit = i % 2 === 1;
    const jitter = rnd();
    const y = summit
      ? high + (low - high) * jitter * 0.62
      : low - (low - high) * jitter * 0.3;
    pts.push([x, y]);
  }

  const at = (i: number) => pts[Math.min(pts.length - 1, Math.max(0, i))];
  let d = `M${at(0)[0]},${at(0)[1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = at(i - 1);
    const [x1, y1] = at(i);
    const [x2, y2] = at(i + 1);
    const [x3, y3] = at(i + 2);
    const c1x = x1 + ((x2 - x0) / 6) * tension;
    const c1y = y1 + ((y2 - y0) / 6) * tension;
    const c2x = x2 - ((x3 - x1) / 6) * tension;
    const c2y = y2 - ((y3 - y1) / 6) * tension;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
  }
  return `${d} L${VB_W + span},${VB_H} L${-span},${VB_H} Z`;
}

const LAYERS = SPECS.map((spec) => ({ spec, d: ridgePath(spec) }));

export function Ridges() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.4,
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* high haze — the light the ridges sit in */}
      <div
        className="absolute -top-[24%] -right-[12%] size-[min(74vw,880px)] rounded-full opacity-[0.14] blur-[130px]"
        style={{ background: "var(--accent)" }}
      />
      <div
        className="absolute top-[14%] -left-[16%] size-[min(62vw,720px)] rounded-full opacity-[0.10] blur-[140px]"
        style={{ background: "var(--sky)" }}
      />

      <div
        className="absolute inset-0"
        style={{ opacity: "var(--ridge-strength)" }}
      >
        {LAYERS.map((layer, i) => (
          <Ridge
            key={i}
            d={layer.d}
            spec={layer.spec}
            index={i}
            progress={progress}
            still={Boolean(reduced)}
          />
        ))}
      </div>

      {/* ground fade so the nearest ridge melts into the page */}
      <div
        className="absolute inset-x-0 bottom-0 h-[22vh]"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--bg))",
        }}
      />
    </div>
  );
}

function Ridge({
  d,
  spec,
  index,
  progress,
  still,
}: {
  d: string;
  spec: LayerSpec;
  index: number;
  progress: ReturnType<typeof useSpring>;
  still: boolean;
}) {
  const y = useTransform(progress, [0, 1], [0, spec.travel]);
  const id = `ridge-${index}`;

  return (
    <div
      className={`absolute inset-x-[-10%] bottom-0 h-[54vh] w-[120%]${still ? "" : " u-sway"}`}
      style={
        still
          ? undefined
          : ({
              "--sway": `${spec.sway}px`,
              "--period": `${spec.period}s`,
            } as CSSProperties)
      }
    >
      <motion.svg
        className="size-full"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        style={still ? undefined : { y }}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor={spec.from} stopOpacity={0.95} />
            <stop offset="55%" stopColor={spec.to} stopOpacity={0.45} />
            <stop offset="100%" stopColor={spec.to} stopOpacity={0.08} />
          </linearGradient>
        </defs>
        <path d={d} fill={`url(#${id})`} opacity={spec.opacity} />
        <path
          d={d}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          opacity={spec.crest}
        />
      </motion.svg>
    </div>
  );
}
