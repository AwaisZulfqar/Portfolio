"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Reveal, SplitText } from "@/components/ui/reveal";
import { site } from "@/lib/site";

export function Work() {
  return (
    <section id="work" className="relative py-20 md:py-28">
      <div className="shell">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="u-label mb-5">02 — Selected work</p>
            <SplitText
              as="h2"
              text="Things I've shipped."
              className="text-[clamp(1.9rem,3.8vw,3.2rem)] leading-[1.02] font-semibold tracking-[-0.03em]"
            />
          </div>
          <Reveal delay={0.2}>
            <p className="max-w-sm text-[15px] leading-relaxed text-muted">
              Six products across client work and my own — architecture, API, interface
              and deploy.
            </p>
          </Reveal>
        </div>

        <div className="grid border-t md:grid-cols-2">
          {site.projects.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

type Project = (typeof site.projects)[number];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hover, setHover] = useState(false);
  const linked = project.href.length > 0;
  const external = project.href.startsWith("http");
  const source = project.href.includes("github.com");
  const Tag = linked ? motion.a : motion.div;

  return (
    <Reveal
      delay={(index % 2) * 0.06}
      y={24}
      className="border-b md:[&:nth-child(odd)]:border-r"
    >
      <Tag
        {...(linked
          ? {
              href: project.href,
              target: external ? "_blank" : undefined,
              rel: external ? "noreferrer" : undefined,
            }
          : {})}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`group relative flex h-full flex-col gap-4 p-6 md:p-8 ${
          linked ? "cursor-pointer" : ""
        }`}
      >
        <span
          aria-hidden
          className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
          style={{ background: "var(--surface)" }}
        />

        <div className="relative flex items-start justify-between gap-4">
          <span className="u-label pt-1">{project.index}</span>
          <div className="flex items-center gap-2">
            {project.live && (
              <span className="u-label flex items-center gap-1.5 !text-accent">
                <span className="u-ping relative inline-block size-1.5 rounded-full bg-accent" />
                Live
              </span>
            )}
            {!project.live && source && (
              <span className="u-label border px-2 py-0.5">Source</span>
            )}
            {linked && (
              <motion.span
                animate={{ x: hover ? 3 : 0, y: hover ? -3 : 0 }}
                className="grid size-9 shrink-0 place-items-center border transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-[color:var(--accent-ink)]"
                style={{ borderColor: "var(--line-strong)" }}
              >
                ↗
              </motion.span>
            )}
          </div>
        </div>

        <div className="relative">
          <h3 className="text-[clamp(1.35rem,2.4vw,2rem)] leading-tight font-semibold tracking-[-0.025em]">
            {project.title}
          </h3>
          <p className="mt-1 text-[15px] text-ink-2">{project.subtitle}</p>
          <p className="u-label mt-2">
            {project.role} · {project.year}
          </p>
        </div>

        <p className="relative text-[15px] leading-relaxed text-muted">{project.body}</p>

        <div className="relative mt-auto flex flex-wrap items-center gap-2 pt-2">
          {project.tags.map((t) => (
            <span key={t} className="u-label border px-2.5 py-1">
              {t}
            </span>
          ))}
        </div>

        <div
          className="relative flex items-center justify-between border-t pt-3 text-sm font-semibold text-accent"
          style={{ borderColor: "var(--line)" }}
        >
          {project.metric}
          <span className="u-label">{linked ? (source ? "View source" : "Visit") : "Client work"}</span>
        </div>
      </Tag>
    </Reveal>
  );
}
