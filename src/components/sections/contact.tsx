"use client";

import { useEffect, useState } from "react";
import { Magnetic } from "@/components/ui/magnetic";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/lib/site";

/** Inline mark so the WhatsApp link reads at a glance, no icon dependency. */
function WhatsAppMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4 shrink-0 fill-current text-accent"
    >
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2 22l5.17-1.5A9.9 9.9 0 1 0 12.04 2Zm0 1.84a8.06 8.06 0 1 1-4.1 14.99l-.29-.17-3.06.89.9-2.98-.19-.31A8.06 8.06 0 0 1 12.04 3.84Zm-3.2 3.9c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.7 4.18 3.68 2.06.81 2.48.65 2.93.61.45-.04 1.44-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.31-.74-1.79-.19-.46-.39-.4-.54-.41h-.46Z" />
    </svg>
  );
}

export function Contact() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Karachi",
        }).format(new Date()),
      );
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="contact" className="relative overflow-hidden py-20 md:py-28">
      <div className="shell relative">
        <p className="u-label mb-8">05 — Contact</p>

        <Reveal>
          <a
            href={`mailto:${site.email}`}
            className="group block max-w-4xl text-[clamp(2.2rem,7vw,6rem)] leading-[0.95] font-semibold tracking-[-0.04em]"
          >
            Let&apos;s build
            <br />
            <span className="u-display italic text-accent">something real.</span>
            <span className="mt-6 block h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
          </a>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Magnetic>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center gap-3 border px-6 py-3.5 text-sm font-semibold"
                style={{ background: "var(--accent)", color: "var(--accent-ink)", borderColor: "var(--accent)" }}
              >
                {site.email}
              </a>
            </Magnetic>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noreferrer"
              aria-label={`Message ${site.shortName} on WhatsApp at ${site.phone}`}
              className="group inline-flex items-center gap-3 border px-6 py-3.5 text-sm font-semibold transition-colors hover:border-accent"
              style={{ borderColor: "var(--line-strong)" }}
            >
              <WhatsAppMark />
              {site.phone}
              <span className="u-label transition-colors group-hover:!text-accent">
                WhatsApp
              </span>
            </a>
            <span className="u-label">
              {site.location} · {time} local
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-14 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="group flex items-center justify-between border-t py-6 transition-colors"
              >
                <span className="text-sm font-semibold">{s.label}</span>
                <span className="text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
