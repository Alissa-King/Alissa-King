import { Suspense } from "react";
import StarMap from "@/components/StarMap";
import TonightSky from "@/components/TonightSky";
import MoonPhase from "@/components/MoonPhase";

export const metadata = {
  title: "Tonight's Sky — AstroScope",
  description: "Interactive star map with real-time constellation positions, moon phase, and planetary visibility",
};

function StarMapSkeleton() {
  return (
    <div className="flex justify-center">
      <div className="skeleton rounded-full" style={{ width: 520, height: 520 }} />
    </div>
  );
}

export default function SkyPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-slow" />
          Live Sky · Computed for Your Time Zone
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Tonight&apos;s Sky</h1>
        <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
          Real-time star map showing the sky as it appears tonight from mid-northern latitudes (~40°N).
          Stars are placed using actual Right Ascension and Declination coordinates with your current
          Local Sidereal Time. Hover over bright stars to identify them.
        </p>
      </div>

      {/* Star map */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8 border border-indigo-500/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Sky Dome — Azimuthal Projection</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Center = zenith · Edge = horizon · N top · 50 named stars · constellation lines
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-xs text-slate-600 gap-1">
            <span>Observer: 40°N 74°W</span>
            <span>Altitude rings: 30° / 60°</span>
          </div>
        </div>

        <Suspense fallback={<StarMapSkeleton />}>
          <StarMap lat={40} lon={-74} />
        </Suspense>
      </div>

      {/* Observing conditions */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-500/20" />
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-widest">Observing Conditions</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-500/20" />
        </div>
        <Suspense fallback={<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}</div>}>
          <TonightSky />
        </Suspense>
      </div>

      {/* Astronomy guide */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-indigo-400">◎</span>
            Reading the Star Map
          </h3>
          <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
            <p>
              <span className="text-slate-300 font-semibold">Projection:</span> Azimuthal equidistant —
              the sky dome projected onto a flat circle. The center is directly overhead (zenith),
              and the rim is the horizon all around you.
            </p>
            <p>
              <span className="text-slate-300 font-semibold">Directions:</span> North is at the top,
              South at bottom — but unlike a map, East is to the left (since you&apos;re looking up,
              not down). The dashed rings mark 30° and 60° altitude above the horizon.
            </p>
            <p>
              <span className="text-slate-300 font-semibold">Star colors:</span> Blue-white stars (B/A type)
              are hotter and younger. Yellow-orange (G/K) are sun-like. Red stars (M type) are cool
              red giants — Betelgeuse and Antares are famous examples.
            </p>
            <p>
              <span className="text-slate-300 font-semibold">Updates:</span> The map recalculates every
              30 seconds using your browser&apos;s current time and the Local Sidereal Time formula.
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-amber-400">◐</span>
            Deep-Sky Targets Tonight
          </h3>
          <div className="space-y-3">
            {[
              { name: "M42 — Orion Nebula", type: "Emission nebula", mag: "4.0", desc: "Stellar nursery 1,344 ly away — visible to naked eye as fuzzy patch below Orion's Belt" },
              { name: "M45 — Pleiades",     type: "Open cluster",    mag: "1.6", desc: "Seven Sisters cluster in Taurus — one of the nearest star clusters at 444 ly" },
              { name: "M31 — Andromeda",    type: "Galaxy",          mag: "3.4", desc: "Nearest large galaxy at 2.5 Mly — visible naked-eye as elongated smudge in dark skies" },
              { name: "M13 — Hercules",     type: "Globular cluster",mag: "5.8", desc: "Northern sky's finest globular — 300,000 stars packed into a 145 ly sphere" },
            ].map(({ name, type, mag, desc }) => (
              <div key={name} className="border-b border-slate-800/50 last:border-0 pb-3 last:pb-0">
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="text-xs font-semibold text-slate-200">{name}</span>
                  <span className="text-[10px] text-sky-400 font-mono">mag {mag}</span>
                </div>
                <div className="text-[10px] text-indigo-400 mb-1">{type}</div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scientific note */}
      <div className="mt-6 glass-card rounded-xl p-4 border-l-4 border-indigo-500/40 text-xs text-slate-500 leading-relaxed">
        <span className="text-indigo-400 font-semibold">Sidereal Time: </span>
        The map uses Greenwich Mean Sidereal Time (GMST) corrected for your longitude to compute
        each star&apos;s Hour Angle — the angle between your meridian and the star&apos;s Right Ascension.
        This determines whether a star is rising, transiting overhead, or setting. Stars complete
        one full circuit of the sky in 23h 56m 4s (one sidereal day), 3m 56s faster than a solar day.
      </div>
    </div>
  );
}
