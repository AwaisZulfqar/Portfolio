"use client";

import Image from "next/image";
import { Reveal, SplitText } from "@/components/ui/reveal";
import { site } from "@/lib/site";

export function About() {
  return (
    <section id="about" className="relative py-20 md:py-28">
      <div className="shell">
        <p className="u-label mb-6">01 — About</p>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-14">
          {/* portrait */}
          <Reveal>
            <figure className="group relative mx-auto w-full max-w-[280px] lg:mx-0 lg:max-w-none">
              <div
                className="relative aspect-square w-full overflow-hidden border"
                style={{ borderColor: "var(--line-strong)" }}
              >
                <Image
                  src={site.portrait}
                  alt={`${site.name}, ${site.role}`}
                  fill
                  sizes="(min-width: 1024px) 320px, 80vw"
                  className="scale-[1.08] object-cover grayscale transition-all duration-700 group-hover:scale-[1.12] hover:grayscale-0"
                  priority={false}
                />
                {/* registration ticks, like the badge */}
                <span className="pointer-events-none absolute top-3 left-3 size-5 border-t-2 border-l-2 border-accent" />
                <span className="pointer-events-none absolute right-3 bottom-3 size-5 border-r-2 border-b-2 border-accent" />
              </div>
              <figcaption className="u-label mt-4 flex items-center justify-between">
                <span>{site.shortName}</span>
                <span className="text-accent">{site.location}</span>
              </figcaption>

              <dl className="mt-8 border-t">
                {[
                  ["Experience", "2 years, production"],
                  ["Current role", "Open to offers"],
                  ["Education", "BS Software Engineering"],
                  ["Languages", "English · Urdu"],
                  ["Timezone", "UTC+5 · overlaps EU & US AM"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-baseline justify-between gap-4 border-b py-2.5"
                  >
                    <dt className="u-label">{k}</dt>
                    <dd className="text-right text-[13px] font-medium text-ink-2">{v}</dd>
                  </div>
                ))}
              </dl>

              <a
                href={site.resume}
                target="_blank"
                rel="noreferrer"
                className="u-label mt-6 inline-flex items-center gap-2 border px-3 py-2 transition-colors hover:border-accent hover:!text-accent"
              >
                Download CV ↗
              </a>
            </figure>
          </Reveal>

          <div>
            <SplitText
              as="h2"
              text="Products, not just code."
              className="text-[clamp(1.9rem,4vw,3.4rem)] leading-[1.03] font-semibold tracking-[-0.03em]"
            />

            <Reveal delay={0.1}>
              <p className="mt-6 text-lg leading-relaxed text-ink-2">{site.intro}</p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-5 text-lg leading-relaxed text-ink-2">{site.introSecond}</p>
            </Reveal>

            <div className="mt-10 border-b">
              {site.services.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.08} className="border-t">
                  <div className="group relative py-7 pr-6 pl-6 transition-colors duration-300">
                    <span
                      className="absolute top-0 left-0 h-full w-[2px] origin-top scale-y-0 bg-accent transition-transform duration-500 group-hover:scale-y-100"
                      aria-hidden
                    />
                    <div className="flex items-baseline justify-between gap-6">
                      <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
                      <span className="u-label">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
