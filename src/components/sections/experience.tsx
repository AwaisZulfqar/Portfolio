"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal, SplitText } from "@/components/ui/reveal";
import { site } from "@/lib/site";

export function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 60%"],
  });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="relative py-20 md:py-28">
      <div className="shell">
        <div className="mb-10">
          <p className="u-label mb-6">04 — Experience</p>
          <SplitText
            as="h2"
            text="Where I've been working."
            className="text-[clamp(1.9rem,3.8vw,3.2rem)] leading-[1.02] font-semibold tracking-[-0.03em]"
          />
        </div>

        <div ref={ref} className="relative pl-8 md:pl-12">
          <span
            aria-hidden
            className="absolute top-2 bottom-2 left-0 w-px"
            style={{ background: "var(--line)" }}
          />
          <motion.span
            aria-hidden
            className="absolute top-2 bottom-2 left-0 w-px origin-top bg-accent"
            style={{ scaleY: line }}
          />

          {site.experience.map((job, i) => (
            <Reveal key={job.company} delay={i * 0.08}>
              <div className="relative grid gap-5 py-7 md:grid-cols-[190px_minmax(0,1fr)] md:gap-10">
                <span
                  aria-hidden
                  className="absolute top-[38px] -left-8 size-2.5 rotate-45 border md:-left-12"
                  style={{ background: "var(--accent)", borderColor: "var(--accent)" }}
                />
                <div>
                  <p className="u-label">{job.period}</p>
                  <p className="mt-2 text-sm font-semibold">{job.company}</p>
                  <p className="u-label mt-1">{job.place}</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
                    {job.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {job.points.map((pt) => (
                      <li
                        key={pt}
                        className="flex gap-3 text-[15px] leading-relaxed text-muted"
                      >
                        <span className="mt-2 size-1 shrink-0 rotate-45 bg-accent" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal delay={0.12}>
            <div className="relative grid gap-5 py-7 md:grid-cols-[190px_minmax(0,1fr)] md:gap-10">
              <span
                aria-hidden
                className="absolute top-[38px] -left-8 size-2.5 rotate-45 border md:-left-12"
                style={{ borderColor: "var(--line-strong)" }}
              />
              <div>
                <p className="u-label">Education</p>
                <p className="mt-2 text-sm font-semibold">{site.education.school}</p>
                <p className="u-label mt-1">{site.education.place}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
                  {site.education.degree}
                </h3>
                <p className="mt-2 text-[15px] text-muted">{site.education.detail}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
