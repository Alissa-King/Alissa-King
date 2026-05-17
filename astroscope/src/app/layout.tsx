import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AstroScope v2 — Space Intelligence Dashboard",
  description:
    "Mission control for the cosmos. Live ISS tracking, near-Earth asteroid feeds, tonight's sky conditions, and NASA's Astronomy Picture of the Day — unified in one cinematic dashboard.",
  openGraph: {
    title: "AstroScope v2 — Space Intelligence Dashboard",
    description: "Real-time NASA data, live ISS tracking, star maps and more.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col text-slate-200 antialiased">
        {/* Static star field */}
        <div className="star-field" />

        {/* Animated nebula blobs */}
        <div className="nebula-layer" aria-hidden="true">
          <div className="nebula-blob nebula-blob-1" />
          <div className="nebula-blob nebula-blob-2" />
          <div className="nebula-blob nebula-blob-3" />
          <div className="nebula-blob nebula-blob-4" />
        </div>

        <Nav />
        <main className="flex-1 relative z-10">{children}</main>

        <footer className="relative z-10 border-t border-slate-800/40 bg-slate-950/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-sky-500 text-base">✦</span>
              <span className="font-semibold text-slate-400">AstroScope v2</span>
              <span className="text-slate-700">·</span>
              <span>Space Intelligence Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://api.nasa.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-400 transition-colors"
              >
                NASA Open APIs
              </a>
              <span className="text-slate-700">·</span>
              <a
                href="https://wheretheiss.at"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition-colors"
              >
                ISS Tracker API
              </a>
              <span className="text-slate-700">·</span>
              <span>Built with Next.js</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
