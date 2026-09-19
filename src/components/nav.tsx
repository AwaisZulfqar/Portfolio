"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { useTheme } from "@/components/theme-provider";
import { site } from "@/lib/site";

const links = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
];

export function Nav() {
  const { theme, toggle } = useTheme();
  const [solid, setSolid] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className="border-b transition-colors duration-500"
        style={{
          background: solid ? "var(--bg)" : "transparent",
          borderColor: solid ? "var(--line)" : "transparent",
        }}
      >
        <nav className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between px-6 md:px-10">
          <a href="#top" className="group flex items-center gap-3">
            <span
              className="grid size-8 place-items-center border text-[12px] font-bold tracking-tight"
              style={{ borderColor: "var(--line-strong)", background: "var(--accent)", color: "var(--accent-ink)" }}
            >
              {site.initials}
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:block">
              {site.shortName}
            </span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative px-3 py-2 text-sm text-ink-2 transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {site.available && (
              <span className="u-label hidden items-center gap-2 sm:flex">
                <span className="u-ping relative inline-block size-1.5 rounded-full bg-accent" />
                Available
              </span>
            )}
            <button
              type="button"
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="grid size-9 place-items-center border transition-colors hover:border-accent"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}
            >
              <span className="text-[13px]">{theme === "dark" ? "☾" : "☀"}</span>
            </button>
          </div>
        </nav>
      </div>
      <motion.div
        className="h-px origin-left bg-accent"
        style={{ scaleX: progress }}
      />
    </header>
  );
}
