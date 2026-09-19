"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Magnetic } from "@/components/ui/magnetic";
import { Lanyard } from "@/components/lanyard/lanyard";
import { Reveal, SplitText } from "@/components/ui/reveal";
import { site } from "@/lib/site";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[88svh] flex-col justify-start overflow-hidden pt-24 pb-14 md:pt-28 md:pb-16"
    >
      <motion.div style={{ y, opacity: fade }} className="shell relative w-full">
        <Reveal y={16}>
          <div className="mb-8 flex flex-wrap items-center gap-3">
            {site.available && (
              <span className="u-label flex items-center gap-2 border px-3 py-1.5">
                <span className="u-ping relative inline-block size-1.5 rounded-full bg-accent" />
                Available for work
              </span>
            )}
            <span className="u-label border px-3 py-1.5">{site.location}</span>
          </div>
        </Reveal>

        <h1 className="text-[clamp(2.6rem,7.6vw,7.2rem)] leading-[0.92] font-semibold tracking-[-0.035em]">
          <SplitText as="p" text="Hafiz Awais" />
          <SplitText as="p" text="Zulfqar." delay={0.08} className="u-display italic text-accent" />
        </h1>

        <Reveal delay={0.28}>
          <p className="u-label mt-7 !text-ink flex flex-wrap items-center gap-3">
            <span className="inline-block h-px w-10 bg-accent align-middle" />
            {site.role}
          </p>
        </Reveal>

        <Reveal delay={0.38} className="mt-6 max-w-xl">
          <p className="u-balance text-lg leading-relaxed text-ink-2">{site.tagline}</p>
        </Reveal>

        <Reveal delay={0.48}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <a
                href="#work"
                className="group inline-flex items-center gap-3 border px-6 py-3.5 text-sm font-semibold transition-colors"
                style={{ background: "var(--accent)", color: "var(--accent-ink)", borderColor: "var(--accent)" }}
              >
                See my work
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            </Magnetic>
            <Magnetic strength={0.22}>
              <a
                href={site.resume}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 border px-6 py-3.5 text-sm font-semibold transition-colors hover:border-accent"
                style={{ borderColor: "var(--line-strong)" }}
              >
                Download CV
                <span className="u-label">PDF</span>
              </a>
            </Magnetic>
            <a
              href={`mailto:${site.email}`}
              className="text-sm font-semibold underline decoration-1 underline-offset-4 transition-colors hover:text-accent"
            >
              Get in touch
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.58}>
          <div className="mt-14 grid gap-10 border-t pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:gap-14">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4">
              {site.stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-semibold tracking-tight md:text-3xl">
                    {s.value}
                  </dt>
                  <dd className="u-label mt-1.5">{s.label}</dd>
                </div>
              ))}
            </dl>

            <dl className="lg:border-l lg:pl-10">
              {site.now.map((n) => (
                <div
                  key={n.key}
                  className="flex items-baseline justify-between gap-4 border-b py-2 last:border-b-0"
                >
                  <dt className="u-label">{n.key}</dt>
                  <dd className="text-right text-[13px] font-medium text-ink-2">
                    {n.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </motion.div>

      {/* phones get the badge in the flow — a fixed one would sit on the copy */}
      <div className="shell w-full lg:hidden">
        <Lanyard variant="inline" />
      </div>

      <motion.div
        className="u-label absolute bottom-7 left-6 hidden items-center gap-3 lg:flex md:left-10"
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="block h-8 w-px" style={{ background: "var(--line-strong)" }} />
        Scroll
      </motion.div>
    </section>
  );
}
