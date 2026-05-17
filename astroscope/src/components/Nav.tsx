"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Telescope, Orbit, Satellite, Image, Home } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/apod", label: "APOD", icon: Telescope },
  { href: "/asteroids", label: "Asteroids", icon: Orbit },
  { href: "/iss", label: "ISS Tracker", icon: Satellite },
  { href: "/artemis", label: "Artemis II", icon: Image },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 h-14">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <span className="text-sky-400 text-xl">✦</span>
          <span className="font-semibold text-white tracking-wide text-sm">
            AstroScope
          </span>
        </Link>
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  active
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
