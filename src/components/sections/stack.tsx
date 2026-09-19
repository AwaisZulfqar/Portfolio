"use client";

import { Reveal, SplitText } from "@/components/ui/reveal";
import { site } from "@/lib/site";

export function Stack() {
  return (
    <section id="stack" className="relative py-20 md:py-28">
      <div className="shell">
        <div className="mb-10">
          <p className="u-label mb-6">03 — Toolkit</p>
          <SplitText
            as="h2"
            text="Tools I reach for."
            className="text-[clamp(1.9rem,3.8vw,3.2rem)] leading-[1.02] font-semibold tracking-[-0.03em]"
          />
        </div>

        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-4">
          {site.stack.map((group, gi) => (
            <Reveal key={group.group} delay={gi * 0.07} className="border-t pt-6">
              <div className="h-full">
                <div className="flex items-center gap-2.5">
                  <span className="size-1.5 rotate-45 bg-accent" />
                  <h3 className="u-label !text-ink">{group.group}</h3>
                </div>
                <ul className="mt-5 space-y-px">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="group flex items-center justify-between border-b py-2.5 text-[15px] transition-colors hover:text-accent"
                      style={{ borderColor: "var(--line)" }}
                    >
                      {item}
                      <span className="translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                        →
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-16 border-t pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h3 className="u-label !text-ink">Platforms I&apos;ve integrated in production</h3>
              <span className="u-label">{site.integrations.length} services</span>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2">
              {site.integrations.map((i) => (
                <li
                  key={i}
                  className="u-label border px-3 py-1.5 transition-colors hover:border-accent hover:!text-accent"
                >
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
