import { Suspense } from "react";
import SolarSystemOrrery from "@/components/SolarSystemOrrery";
import AsteroidOrbitViewer from "@/components/AsteroidOrbitViewer";
import { Globe2 } from "lucide-react";

export const metadata = {
  title: "Solar System Orrery — AstroScope",
  description: "Interactive animated solar system model with real orbital mechanics and asteroid orbit viewer",
};

const PLANET_FACTS = [
  { name: "Mercury", color: "text-slate-400", facts: ["Smallest planet", "No atmosphere", "Extreme temperature swings: −180°C to 430°C"] },
  { name: "Venus",   color: "text-yellow-300", facts: ["Hottest planet (465°C avg)", "Rotates backwards", "Day longer than its year"] },
  { name: "Earth",   color: "text-blue-400",  facts: ["Only known life-bearing world", "Largest terrestrial planet", "Moon stabilizes axial tilt"] },
  { name: "Mars",    color: "text-red-400",   facts: ["Home of Olympus Mons (largest volcano)", "Thin CO₂ atmosphere", "Two tiny moons: Phobos & Deimos"] },
  { name: "Jupiter", color: "text-orange-300",facts: ["Largest planet (1,300 Earths)", "Great Red Spot storms for 350+ years", "79 known moons"] },
  { name: "Saturn",  color: "text-yellow-200",facts: ["Iconic ring system (ice & rock)", "Least dense planet (floats on water!)", "Titan has a thick nitrogen atmosphere"] },
  { name: "Uranus",  color: "text-cyan-300",  facts: ["Rotates on its side (98° tilt)", "Coldest atmosphere: −224°C", "Discovered 1781 by Herschel"] },
  { name: "Neptune", color: "text-indigo-400",facts: ["Strongest winds: 2,100 km/h", "Takes 165 years to orbit Sun", "Triton orbits backwards"] },
];

export default function SolarSystemPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-medium mb-4">
          <Globe2 size={11} />
          Interactive Orrery
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Solar System <span className="text-sky-400">Orrery</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
          Animated model of the solar system using real mean orbital elements. Drag the speed slider
          to accelerate time. Hover over planets for details. Logarithmic scaling keeps all planets
          visible on screen.
        </p>
      </div>

      {/* Orrery + Planet facts */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="skeleton rounded-2xl aspect-square" />}>
            <SolarSystemOrrery />
          </Suspense>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1 mb-3">Planet Facts</h2>
          {PLANET_FACTS.map((p) => (
            <div key={p.name} className="glass-card rounded-xl p-4">
              <h3 className={`text-sm font-bold mb-2 ${p.color}`}>{p.name}</h3>
              <ul className="space-y-1">
                {p.facts.map((f) => (
                  <li key={f} className="text-xs text-slate-400 leading-relaxed flex items-start gap-1.5">
                    <span className="text-slate-600 mt-0.5">·</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Asteroid Orbit Viewer */}
      <div className="border-t border-slate-800/50 pt-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Near-Earth Asteroid <span className="text-amber-400">Orbit Viewer</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Visualize the orbits of five notable near-Earth asteroids using real Keplerian orbital
            elements. See their paths relative to Earth and Mars orbits.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="skeleton rounded-2xl aspect-square" />}>
              <AsteroidOrbitViewer />
            </Suspense>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">About These NEAs</h3>
            <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
              <p><span className="text-amber-400 font-semibold">Apophis (99942)</span> — Will pass within 32,000 km of Earth on April 13, 2029 — closer than geostationary satellites. Ruled out for impact through 2060.</p>
              <p><span className="text-amber-400 font-semibold">Bennu (101955)</span> — Sampled by OSIRIS-REx in 2020. Carbon-rich, potentially containing organic molecules. ~1-in-2700 impact chance in 2182.</p>
              <p><span className="text-amber-400 font-semibold">Eros (433)</span> — First asteroid to be orbited and landed on by a spacecraft (NEAR Shoemaker, 2001). S-type, ~34 km long.</p>
              <p><span className="text-amber-400 font-semibold">Ryugu (162173)</span> — Sampled by Hayabusa2 (2018–2019). Confirmed carbonaceous material with organic compounds and water.</p>
              <p><span className="text-amber-400 font-semibold">2024 YR4</span> — Discovered December 2024. Briefly had the highest impact probability ever recorded (~3%) before additional observations ruled it out for 2032.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
