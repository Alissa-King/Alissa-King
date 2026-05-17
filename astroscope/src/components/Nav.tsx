"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Telescope, Orbit, Satellite, ImageIcon, LayoutDashboard, Moon } from "lucide-react";

const links = [
  { href: "/",         label: "Tonight",  icon: LayoutDashboard, color: "sky"     },
  { href: "/sky",      label: "Sky Map",  icon: Moon,             color: "indigo"  },
  { href: "/apod",     label: "APOD",     icon: Telescope,        color: "violet"  },
  { href: "/asteroids",label: "Asteroids",icon: Orbit,            color: "amber"   },
  { href: "/iss",      label: "ISS",      icon: Satellite,        color: "emerald" },
  { href: "/artemis",  label: "Artemis",  icon: ImageIcon,        color: "sky"     },
];

const colorMap: Record<string, { active: string; dot: string }> = {
  sky:     { active: "bg-sky-500/15 text-sky-300 border-sky-500/30",     dot: "bg-sky-400"     },
  indigo:  { active: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30", dot: "bg-indigo-400" },
  violet:  { active: "bg-violet-500/15 text-violet-300 border-violet-500/30", dot: "bg-violet-400" },
  amber:   { active: "bg-amber-500/15 text-amber-300 border-amber-500/30",   dot: "bg-amber-400"   },
  emerald: { active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
};

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/85 backdrop-blur-xl">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 h-14">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 mr-5 group shrink-0">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-sky-500/10 group-hover:bg-sky-500/20 transition-colors" />
            <span className="text-sky-400 text-lg leading-none group-hover:text-sky-300 transition-colors">✦</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold text-white tracking-widest uppercase">AstroScope</span>
            <span className="text-[9px] text-sky-500/70 tracking-[0.2em] uppercase font-medium">v2</span>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
          {links.map(({ href, label, icon: Icon, color }) => {
            const active = pathname === href;
            const c = colorMap[color];
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap border ${
                  active
                    ? `${c.active} border-opacity-100`
                    : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 border-transparent"
                }`}
              >
                {active && (
                  <span className={`w-1 h-1 rounded-full ${c.dot} pulse-slow`} />
                )}
                <Icon size={13} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side: live indicator */}
        <div className="ml-auto shrink-0 hidden sm:flex items-center gap-1.5 text-xs text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-twinkle-fast" />
          <span className="font-mono text-[10px] tracking-widest">LIVE</span>
        </div>
      </div>
    </nav>
  );
}
