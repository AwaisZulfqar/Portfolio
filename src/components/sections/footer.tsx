import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative border-t py-10">
      <div className="shell flex flex-wrap items-center justify-between gap-4">
        <p className="u-label">
          © {new Date().getFullYear()} {site.name} — {site.role}
        </p>
        <p className="u-label">Built with Next.js · Motion</p>
        <a href="#top" className="u-label transition-colors hover:text-accent">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
