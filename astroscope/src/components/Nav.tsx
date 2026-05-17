"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Telescope, Orbit, Satellite, ImageIcon, LayoutDashboard, Moon, Globe2, Rocket, Star } from "lucide-react";

// Main nav links (always show label)
const mainLinks = [
  { href: "/",         label: "Tonight",  icon: LayoutDashboard, color: "sky"     },
  { href: "/sky",      label: "Sky Map",  icon: Moon,             color: "indigo"  },
  { href: "/apod",     label: "APOD",     icon: Telescope,        color: "violet"  },
  { href: "/asteroids",label: "Asteroids",icon: Orbit,            color: "amber"   },
  { href: "/iss",      label: "ISS",      icon: Satellite,        color: "emerald" },
  { href: "/artemis",  label: "Artemis",  icon: ImageIcon,        color: "sky"     },
];

// Secondary links (icon + label on md+, icon-only on mobile)
const extraLinks = [
  { href: "/solar-system", label: "Orrery",    icon: Globe2,  color: "sky"    },
  { href: "/launches",     label: "Launches",  icon: Rocket,  color: "amber"  },
  { href: "/star-chart",   label: "Sky Chart", icon: Star,    color: "indigo" },
];

const colorMap: Record<string, { active: string; dot: string }> = {
  sky:     { active: "bg-sky-500/15 text-sky-300 border-sky-500/30",         dot: "bg-sky-400"     },
  indigo:  { active: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30", dot: "bg-indigo-400" },
  violet:  { active: "bg-violet-500/15 text-violet-300 border-violet-500/30", dot: "bg-violet-400" },
  amber:   { active: "bg-amber-500/15 text-amber-300 border-amber-500/30",    dot: "bg-amber-400"  },
  emerald: { active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
};

function NavLink({
  href, label, icon: Icon, color, active, iconOnly = false,
}: {
  href: string; label: string; icon: React.ElementType; color: string; active: boolean; iconOnly?: boolean;
}) {
  const c = colorMap[color];
  return (
    <Link
      href={href}
      title={label}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap border ${
        active
          ? `${c.active} border-opacity-100`
          : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 border-transparent"
      }`}
    >
      {active && <span className={`w-1 h-1 rounded-full ${c.dot} pulse-slow`} />}
      <Icon size={13} />
      {!iconOnly && <span className="hidden sm:inline">{label}</span>}
      {!iconOnly && <span className="sm:hidden sr-only">{label}</span>}
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/85 backdrop-blur-xl">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-14">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 mr-3 group shrink-0">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-sky-500/10 group-hover:bg-sky-500/20 transition-colors" />
            <span className="text-sky-400 text-lg leading-none group-hover:text-sky-300 transition-colors">✦</span>
          </div>
          <div className="flex-col leading-none hidden sm:flex">
            <span className="text-xs font-bold text-white tracking-widest uppercase">AstroScope</span>
            <span className="text-[9px] text-sky-500/70 tracking-[0.2em] uppercase font-medium">v2</span>
          </div>
        </Link>

        {/* Main nav links */}
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
          {mainLinks.map(({ href, label, icon, color }) => (
            <NavLink
              key={href}
              href={href} label={label} icon={icon} color={color}
              active={pathname === href}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-800 mx-1 shrink-0 hidden sm:block" />

        {/* Extra links (icon + label md+, icon-only on mobile) */}
        <div className="flex items-center gap-0.5 shrink-0">
          {extraLinks.map(({ href, label, icon, color }) => (
            <NavLink
              key={href}
              href={href} label={label} icon={icon} color={color}
              active={pathname === href || pathname.startsWith(href + "/")}
              iconOnly={false}
            />
          ))}
        </div>

        {/* Live indicator */}
        <div className="ml-auto shrink-0 hidden lg:flex items-center gap-1.5 text-xs text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-twinkle-fast" />
          <span className="font-mono text-[10px] tracking-widest">LIVE</span>
        </div>
      </div>
    </nav>
  );
}
