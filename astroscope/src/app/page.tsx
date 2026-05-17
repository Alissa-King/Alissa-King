import Link from "next/link";
import { Telescope, Orbit, Satellite, Image as ImageIcon, ArrowRight } from "lucide-react";

const features = [
  {
    href: "/apod",
    icon: Telescope,
    title: "Astronomy Picture of the Day",
    description:
      "NASA's iconic daily image — stunning photography and scientific imagery from across the universe, with expert explanations.",
    color: "from-violet-500/20 to-transparent",
    border: "border-violet-500/30 hover:border-violet-400/60",
    iconColor: "text-violet-400",
  },
  {
    href: "/asteroids",
    icon: Orbit,
    title: "Near-Earth Asteroid Tracker",
    description:
      "Live 7-day feed of asteroids approaching Earth, with size estimates, velocities, miss distances, and hazard classifications.",
    color: "from-amber-500/20 to-transparent",
    border: "border-amber-500/30 hover:border-amber-400/60",
    iconColor: "text-amber-400",
  },
  {
    href: "/iss",
    icon: Satellite,
    title: "ISS Live Tracker",
    description:
      "Real-time position of the International Space Station — latitude, longitude, altitude, and orbital velocity updated live.",
    color: "from-emerald-500/20 to-transparent",
    border: "border-emerald-500/30 hover:border-emerald-400/60",
    iconColor: "text-emerald-400",
  },
  {
    href: "/artemis",
    icon: ImageIcon,
    title: "Artemis II Gallery",
    description:
      "Official NASA photography from the 2026 crewed lunar flyby — the first humans to see the far side of the Moon in over 50 years.",
    color: "from-sky-500/20 to-transparent",
    border: "border-sky-500/30 hover:border-sky-400/60",
    iconColor: "text-sky-400",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 pulse-slow inline-block" />
          Live NASA Data
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
          <span className="text-white">Explore the</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400 glow-text">
            Cosmos
          </span>
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          A real-time NASA space dashboard tracking asteroids, the International
          Space Station, and the historic Artemis II lunar mission.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/apod"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-colors"
          >
            Start Exploring <ArrowRight size={16} />
          </Link>
          <Link
            href="/artemis"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold transition-all"
          >
            Artemis II Gallery
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {features.map(({ href, icon: Icon, title, description, color, border, iconColor }) => (
          <Link key={href} href={href} className="group block">
            <div
              className={`h-full rounded-2xl border glass-card p-6 transition-all duration-300 ${border}`}
            >
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} mb-4`}
              >
                <Icon size={24} className={iconColor} />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-sky-300 transition-colors">
                {title}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-sky-400 transition-colors">
                View <ArrowRight size={12} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats bar */}
      <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "NASA APIs", value: "4" },
          { label: "Live data feeds", value: "3" },
          { label: "Artemis II photos", value: "12K+" },
          { label: "Miles above Earth (ISS)", value: "~250" },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-sky-400">{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
