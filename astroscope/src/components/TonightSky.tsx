"use client";

import { useMemo } from "react";
import MoonPhase from "./MoonPhase";

interface PlanetInfo {
  name: string;
  symbol: string;
  elongation: number;
  visible: boolean;
  when: string;
  color: string;
  description: string;
}

// Simplified heliocentric longitude using mean motion
// Elements for J2000 epoch
const PLANET_ELEMENTS: Record<string, { L0: number; rate: number; color: string; symbol: string }> = {
  Mercury: { L0: 252.251, rate: 4.092317,  color: "#94a3b8", symbol: "☿" },
  Venus:   { L0: 181.980, rate: 1.602136,  color: "#fde68a", symbol: "♀" },
  Mars:    { L0: 355.433, rate: 0.524071,  color: "#fb923c", symbol: "♂" },
  Jupiter: { L0:  34.351, rate: 0.083056,  color: "#fed7aa", symbol: "♃" },
  Saturn:  { L0:  50.077, rate: 0.033371,  color: "#fef9c3", symbol: "♄" },
};

const EARTH_L0   = 100.465;
const EARTH_RATE = 0.985647;

function computePlanets(date: Date): PlanetInfo[] {
  const JD = date.getTime() / 86400000 + 2440587.5;
  const d = JD - 2451545.0; // days from J2000

  const earthL = ((EARTH_L0 + EARTH_RATE * d) % 360 + 360) % 360;

  return Object.entries(PLANET_ELEMENTS).map(([name, el]) => {
    const planetL = ((el.L0 + el.rate * d) % 360 + 360) % 360;
    let elong = planetL - earthL;
    if (elong > 180) elong -= 360;
    if (elong < -180) elong += 360;

    // Visibility heuristic
    let visible = false;
    let when = "";
    const absElong = Math.abs(elong);

    if (name === "Mercury" || name === "Venus") {
      // Inner planets
      if (absElong > 15) {
        visible = true;
        when = elong > 0 ? "Evening sky (W)" : "Morning sky (E)";
      } else {
        visible = false;
        when = "Near sun — not visible";
      }
    } else {
      // Outer planets
      if (absElong > 120) {
        visible = true;
        when = "Most of the night";
      } else if (absElong > 60) {
        visible = true;
        when = elong > 0 ? "Evening sky" : "Morning sky";
      } else if (absElong > 30) {
        visible = false;
        when = "Low at dusk/dawn";
      } else {
        visible = false;
        when = "Near sun — not visible";
      }
    }

    const descriptions: Record<string, string> = {
      Mercury: "Rocky, cratered world — fastest orbit at 88 days",
      Venus:   "Brilliant cloud-covered twin — brightest planet",
      Mars:    "Red planet — future crewed mission target",
      Jupiter: "Gas giant with 95 moons — largest in solar system",
      Saturn:  "Ringed beauty — rings visible in small telescope",
    };

    return {
      name,
      symbol: el.symbol,
      elongation: Math.round(elong),
      visible,
      when,
      color: el.color,
      description: descriptions[name] ?? "",
    };
  });
}

function getBestViewingTime(date: Date): string {
  // Astronomical twilight ends ~1.5 hrs after sunset at mid-latitude
  // Rough estimation: assume latitude 40°N
  const month = date.getMonth(); // 0-11
  // Sunset hour (rough) in local time
  const sunsets = [17.1, 17.5, 18.0, 19.5, 20.2, 20.8, 20.7, 20.1, 19.2, 18.0, 17.1, 16.8];
  const sunset = sunsets[month];
  const darkStart = sunset + 1.5;
  const h = Math.floor(darkStart);
  const m = Math.round((darkStart - h) * 60);
  return `~${h}:${m.toString().padStart(2, "0")} local time`;
}

function getSkyQuality(moon: number): { label: string; stars: number; desc: string; color: string } {
  if (moon > 0.8) return { label: "Poor",    stars: 1, desc: "Bright moon — faint objects washed out", color: "text-red-400" };
  if (moon > 0.5) return { label: "Fair",    stars: 2, desc: "Partial moon — bright objects clear",    color: "text-amber-400" };
  if (moon > 0.25) return { label: "Good",   stars: 3, desc: "Gibbous moon — good for planets",        color: "text-yellow-400" };
  return                  { label: "Excellent", stars: 4, desc: "Dark skies — ideal for deep-sky objects", color: "text-emerald-400" };
}

function MoonIllum(): number {
  const JD = new Date().getTime() / 86400000 + 2440587.5;
  const age = ((JD - 2451550.26) % 29.53058867 + 29.53058867) % 29.53058867;
  return 0.5 * (1 - Math.cos(2 * Math.PI * age / 29.53058867));
}

export default function TonightSky() {
  const now = useMemo(() => new Date(), []);
  const planets = useMemo(() => computePlanets(now), [now]);
  const bestTime = useMemo(() => getBestViewingTime(now), [now]);
  const moonIllum = useMemo(() => MoonIllum(), []);
  const sky = useMemo(() => getSkyQuality(moonIllum), [moonIllum]);

  const visible = planets.filter((p) => p.visible);
  const notVisible = planets.filter((p) => !p.visible);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {/* Moon Phase */}
      <MoonPhase />

      {/* Sky Quality */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-widest">
          <span className="w-1 h-1 rounded-full bg-sky-400 pulse-slow" />
          Sky Conditions
        </div>

        <div className="flex items-end gap-3">
          <div>
            <div className={`text-3xl font-bold ${sky.color}`}>{sky.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{sky.desc}</div>
          </div>
          <div className="ml-auto flex gap-1 mb-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg ${i < sky.stars ? "opacity-90" : "opacity-15"}`}
                style={{ color: i < sky.stars ? "#fbbf24" : undefined }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="section-divider my-2" />

        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Best viewing starts</span>
            <span className="text-sky-300 font-semibold data-readout">{bestTime}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Moon illumination</span>
            <span className="text-amber-400 font-semibold data-readout">{Math.round(moonIllum * 100)}%</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Limiting magnitude</span>
            <span className="text-slate-300 font-semibold data-readout">
              {moonIllum < 0.1 ? "6.5+" : moonIllum < 0.4 ? "5.8" : moonIllum < 0.7 ? "4.5" : "3.0"}
            </span>
          </div>
        </div>
      </div>

      {/* Planetary Visibility */}
      <div className="glass-card rounded-2xl p-6 sm:col-span-2 lg:col-span-1 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-widest">
          <span className="w-1 h-1 rounded-full bg-violet-400 pulse-slow" />
          Planetary Visibility
        </div>

        <div className="space-y-2">
          {visible.length > 0 && (
            <>
              <div className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold mb-2">Visible Tonight</div>
              {visible.map((p) => (
                <div key={p.name} className="flex items-center gap-3 py-1.5 border-b border-slate-800/50 last:border-0">
                  <span className="text-xl w-6 text-center" style={{ color: p.color }} title={p.description}>
                    {p.symbol}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-200">{p.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{p.when}</div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    VISIBLE
                  </span>
                </div>
              ))}
            </>
          )}

          {notVisible.length > 0 && (
            <>
              <div className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold mt-3 mb-2">Not Visible</div>
              {notVisible.map((p) => (
                <div key={p.name} className="flex items-center gap-3 py-1 opacity-50">
                  <span className="text-lg w-6 text-center text-slate-600">{p.symbol}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-500">{p.name}</div>
                    <div className="text-[10px] text-slate-600 truncate">{p.when}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
