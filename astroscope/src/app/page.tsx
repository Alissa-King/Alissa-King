import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApod, fetchAsteroidFeed } from "@/lib/nasa";
import DashboardISS from "@/components/DashboardISS";
import TonightSky from "@/components/TonightSky";
import { Telescope, Orbit, Satellite, ImageIcon, AlertTriangle, CheckCircle2, ArrowRight, ExternalLink, ChevronDown } from "lucide-react";
import type { ApodData, NeoFeedResponse } from "@/lib/nasa";

// ── APOD card (server-rendered) ──────────────────────────────────────────────
async function APODCard() {
  let apod: ApodData | null = null;
  try { apod = await fetchApod(); } catch { /* fallback below */ }

  if (!apod) return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 min-h-[260px] justify-center items-center text-center">
      <Telescope size={28} className="text-violet-400" />
      <p className="text-slate-500 text-sm">APOD unavailable</p>
      <Link href="/apod" className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
        Try full page <ArrowRight size={11} />
      </Link>
    </div>
  );

  return (
    <Link href="/apod" className="group glass-card rounded-2xl overflow-hidden flex flex-col hover:border-violet-500/40 border border-slate-800/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]">
      {/* Image */}
      <div className="relative overflow-hidden bg-slate-950" style={{ aspectRatio: "16/9" }}>
        {apod.media_type === "image" ? (
          <>
            <Image
              src={apod.hdurl ?? apod.url}
              alt={apod.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">{apod.title}</h3>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-slate-950 aspect-video">
            <Telescope size={32} className="text-violet-400" />
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className="mission-badge text-[10px]">
            <span className="w-1 h-1 rounded-full bg-violet-400 pulse-slow" />
            APOD TODAY
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{apod.explanation}</p>
        <div className="mt-auto flex items-center justify-between text-xs">
          <span className="text-slate-600">
            {new Date(apod.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <span className="text-violet-400 flex items-center gap-1 group-hover:text-violet-300 transition-colors">
            Full view <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Asteroid summary (server-rendered) ────────────────────────────────────────
async function AsteroidSummary() {
  let feed: NeoFeedResponse | null = null;
  try { feed = await fetchAsteroidFeed(); } catch { /* fallback */ }

  if (!feed) return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 min-h-[260px] justify-center items-center text-center">
      <Orbit size={28} className="text-amber-400" />
      <p className="text-slate-500 text-sm">Asteroid data unavailable</p>
      <Link href="/asteroids" className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
        Try full page <ArrowRight size={11} />
      </Link>
    </div>
  );

  const all = Object.values(feed.near_earth_objects).flat();
  const hazardous = all.filter((a) => a.is_potentially_hazardous_asteroid);
  const sorted = [...all].sort((a, b) => {
    const da = parseFloat(a.close_approach_data[0]?.miss_distance.kilometers ?? "Infinity");
    const db = parseFloat(b.close_approach_data[0]?.miss_distance.kilometers ?? "Infinity");
    return da - db;
  });
  const top3 = sorted.slice(0, 3);
  const threatLevel = hazardous.length === 0 ? "none" : hazardous.length <= 2 ? "watch" : "warning";
  const threatColor = { none: "text-emerald-400", watch: "text-amber-400", warning: "text-red-400" }[threatLevel];
  const threatLabel = { none: "All Clear", watch: "Watch", warning: "Alert" }[threatLevel];

  return (
    <Link href="/asteroids" className="group glass-card rounded-2xl p-5 flex flex-col gap-4 hover:border-amber-500/30 border border-slate-800/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.08)]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
            <span className="w-1 h-1 rounded-full bg-amber-400 pulse-slow" />
            Near-Earth Objects
          </div>
          <div className="text-2xl font-bold text-white">{feed.element_count}</div>
          <div className="text-xs text-slate-500">approaches next 7 days</div>
        </div>
        <div className={`text-right ${threatColor}`}>
          <div className="text-lg font-bold">{threatLabel}</div>
          <div className="text-xs text-slate-500">{hazardous.length} hazardous</div>
        </div>
      </div>

      {/* Threat bar */}
      <div className="relative h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            threatLevel === "none" ? "bg-emerald-500" : threatLevel === "watch" ? "bg-amber-500" : "bg-red-500"
          }`}
          style={{ width: `${Math.min(100, (hazardous.length / Math.max(all.length, 1)) * 100 * 5 + 10)}%` }}
        />
      </div>

      {/* Top 3 */}
      <div className="space-y-2">
        <div className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Closest Approaches</div>
        {top3.map((a) => {
          const app = a.close_approach_data[0];
          const ld = parseFloat(app?.miss_distance.lunar ?? "0").toFixed(1);
          const haz = a.is_potentially_hazardous_asteroid;
          return (
            <div key={a.id} className="flex items-center gap-2 text-xs">
              {haz
                ? <AlertTriangle size={11} className="text-red-400 shrink-0" />
                : <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
              }
              <span className="text-slate-300 truncate flex-1">
                {a.name.replace(/[()]/g, "").trim()}
              </span>
              <span className={`font-semibold data-readout shrink-0 ${haz ? "text-red-400" : "text-emerald-400"}`}>
                {ld} LD
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto text-xs text-amber-400 flex items-center gap-1 group-hover:text-amber-300 transition-colors">
        Full tracker <ArrowRight size={11} />
      </div>
    </Link>
  );
}

// ── Live date (async, inside Suspense) ────────────────────────────────────────
async function LiveDate() {
  const { connection } = await import("next/server");
  await connection();
  const now = new Date();
  return (
    <p className="text-slate-500 text-sm font-mono tracking-widest mb-6" style={{ animation: "fade-in-up 0.6s 0.2s ease-out both" }}>
      {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
    </p>
  );
}

// ── Loading skeletons ─────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="skeleton w-full" style={{ aspectRatio: "16/9" }} />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`max-w-7xl mx-auto px-4 ${className}`}>
      {children}
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {

  return (
    <div className="space-y-0">
      {/* ── Hero ── */}
      <div className="hero-section relative min-h-[92vh] flex flex-col justify-center overflow-hidden">
        {/* Scan line */}
        <div className="hero-scan-line" aria-hidden="true" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(56,189,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-center text-center">
          {/* Status badge */}
          <div className="mission-badge mb-8 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-twinkle-fast" />
            Mission Control · Live Data Active
          </div>

          {/* Title */}
          <h1 className="display-text mb-4" style={{ animation: "fade-in-up 0.6s 0.1s ease-out both" }}>
            <span className="text-white">Tonight</span>
            <br />
            <span className="text-gradient-sky glow-text">in Space</span>
          </h1>

          {/* Date */}
          <Suspense fallback={<p className="text-slate-700 text-sm font-mono tracking-widest mb-6">— — —</p>}>
            <LiveDate />
          </Suspense>

          {/* Description */}
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed mb-10" style={{ animation: "fade-in-up 0.6s 0.3s ease-out both" }}>
            Your unified window into the cosmos — live ISS position, near-Earth asteroid threats,
            tonight&apos;s sky conditions, and NASA&apos;s latest discoveries, all in one place.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 justify-center mb-16" style={{ animation: "fade-in-up 0.6s 0.4s ease-out both" }}>
            <a
              href="#dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-all duration-200 shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)]"
            >
              Open Dashboard <ChevronDown size={16} />
            </a>
            <Link
              href="/sky"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 hover:border-sky-500/50 text-slate-300 hover:text-white font-semibold transition-all duration-200 backdrop-blur-sm"
            >
              Tonight&apos;s Sky Map
            </Link>
          </div>

          {/* Live telemetry strip */}
          <div className="flex flex-wrap items-center justify-center gap-4" style={{ animation: "fade-in-up 0.6s 0.5s ease-out both" }}>
            {[
              { icon: Satellite,  label: "ISS",       value: "ORBITAL",  color: "text-emerald-400", dot: "bg-emerald-400" },
              { icon: Orbit,      label: "Asteroids", value: "TRACKING", color: "text-amber-400",   dot: "bg-amber-400"   },
              { icon: Telescope,  label: "APOD",      value: "LOADED",   color: "text-violet-400",  dot: "bg-violet-400"  },
              { icon: ImageIcon,  label: "Artemis II",value: "ARCHIVE",  color: "text-sky-400",     dot: "bg-sky-400"     },
            ].map(({ icon: Icon, label, value, color, dot }) => (
              <div key={label} className="flex items-center gap-2 glass-card rounded-lg px-3 py-1.5 text-xs">
                <span className={`w-1 h-1 rounded-full ${dot} pulse-slow`} />
                <Icon size={11} className={color} />
                <span className="text-slate-500">{label}</span>
                <span className={`font-mono font-semibold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-700 animate-float">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown size={16} />
        </div>
      </div>

      {/* ── Dashboard section ── */}
      <Section id="dashboard" className="py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-sky-500/20" />
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-widest">
            <span className="w-1 h-1 rounded-full bg-sky-400 pulse-slow" />
            Live Intelligence Feed
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-sky-500/20" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* APOD */}
          <Suspense fallback={<CardSkeleton />}>
            <APODCard />
          </Suspense>

          {/* ISS live */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-twinkle-fast" />
              ISS Live Position
            </div>
            <DashboardISS />
            <Link
              href="/iss"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-1 transition-colors"
            >
              <Satellite size={11} /> Full ISS tracker <ArrowRight size={11} />
            </Link>
          </div>

          {/* Asteroids */}
          <Suspense fallback={
            <div className="glass-card rounded-2xl p-5 space-y-3 min-h-[260px]">
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-8 w-1/3 rounded" />
              <div className="skeleton h-2 rounded-full" />
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="skeleton h-5 rounded" />)}
              </div>
            </div>
          }>
            <AsteroidSummary />
          </Suspense>
        </div>
      </Section>

      {/* ── Tonight's Sky ── */}
      <Section id="sky" className="py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-500/20" />
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest">
            <span className="w-1 h-1 rounded-full bg-indigo-400 pulse-slow" />
            Tonight&apos;s Sky
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-500/20" />
        </div>

        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Sky Conditions &amp; Planetary Visibility</h2>
            <p className="text-slate-500 text-sm mt-1">Observing outlook for tonight · computed in real-time</p>
          </div>
          <Link
            href="/sky"
            className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Full sky map <ExternalLink size={11} />
          </Link>
        </div>

        <Suspense fallback={<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3].map(i => <div key={i} className="skeleton h-52 rounded-2xl" />)}</div>}>
          <TonightSky />
        </Suspense>
      </Section>

      {/* ── Quick links ── */}
      <Section className="py-12 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-700/50" />
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Deep Dives</div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-700/50" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              href: "/sky",
              icon: "◎",
              title: "Interactive Star Map",
              desc: "Real-time sky dome with 50+ named stars, constellation lines, and planetary positions.",
              color: "indigo",
              border: "hover:border-indigo-500/40",
              glow: "hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]",
              iconColor: "text-indigo-400",
              bg: "bg-indigo-500/10",
            },
            {
              href: "/apod",
              icon: "✦",
              title: "APOD Archive",
              desc: "NASA's Astronomy Picture of the Day — breathtaking images with expert explanations.",
              color: "violet",
              border: "hover:border-violet-500/40",
              glow: "hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]",
              iconColor: "text-violet-400",
              bg: "bg-violet-500/10",
            },
            {
              href: "/asteroids",
              icon: "⊕",
              title: "Asteroid Explorer",
              desc: "Interactive charts showing size, velocity, and miss distance for all tracked NEOs.",
              color: "amber",
              border: "hover:border-amber-500/40",
              glow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]",
              iconColor: "text-amber-400",
              bg: "bg-amber-500/10",
            },
            {
              href: "/artemis",
              icon: "◐",
              title: "Artemis II Gallery",
              desc: "Official NASA photography from humanity's first crewed lunar flyby since Apollo 17.",
              color: "sky",
              border: "hover:border-sky-500/40",
              glow: "hover:shadow-[0_0_20px_rgba(56,189,248,0.1)]",
              iconColor: "text-sky-400",
              bg: "bg-sky-500/10",
            },
          ].map(({ href, icon, title, desc, border, glow, iconColor, bg }) => (
            <Link key={href} href={href} className="group block">
              <div className={`glass-card rounded-2xl p-5 h-full border border-slate-800/50 transition-all duration-300 ${border} ${glow}`}>
                <div className={`inline-flex w-10 h-10 rounded-xl ${bg} items-center justify-center text-xl ${iconColor} mb-4`}>
                  {icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-sky-300 transition-colors">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{desc}</p>
                <div className="flex items-center gap-1 text-xs font-medium text-slate-600 group-hover:text-sky-400 transition-colors">
                  Explore <ArrowRight size={11} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
