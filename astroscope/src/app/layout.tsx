import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AstroScope — NASA Space Dashboard",
  description: "Explore the cosmos with live NASA data: Astronomy Picture of the Day, near-Earth asteroids, ISS tracking, and the Artemis II lunar mission.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col text-slate-200">
        <div className="star-field" />
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="text-center py-6 text-slate-600 text-sm border-t border-slate-800/50">
          Data provided by{" "}
          <a href="https://api.nasa.gov" className="text-sky-500 hover:text-sky-400 transition-colors">
            NASA Open APIs
          </a>{" "}
          · Built with Next.js
        </footer>
      </body>
    </html>
  );
}
