import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeScript } from "@/components/theme-provider";
import { Cursor } from "@/components/ui/cursor";
import { Ridges } from "@/components/ui/ridges";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { site } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  // `u-display` is only ever used italic — shipping the roman face too just
  // adds a font file to the critical preload set.
  style: ["italic"],
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.tagline,
  authors: [{ name: site.name }],
  keywords: [
    "Full Stack AI Engineer",
    "RAG",
    "Next.js",
    "Node.js",
    "TypeScript",
    site.name,
  ],
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
    type: "profile",
    images: [{ url: site.portrait, width: 738, height: 738, alt: site.name }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07090a" },
    { media: "(prefers-color-scheme: light)", color: "#f1f3f0" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased`}
      >
        <ThemeProvider>
          <SmoothScroll />
          <Ridges />
          <Cursor />
          <div aria-hidden className="u-grain" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
