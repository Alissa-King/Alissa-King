"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Satellite, Gauge, ArrowUpRight, Clock, Globe, Info } from "lucide-react";
import type { ISSPosition } from "@/lib/nasa";

function latStr(lat: number) { return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`; }
function lonStr(lon: number) { return `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? "E" : "W"}`; }

function ISSGlobe({ lat, lon, trail }: { lat: number; lon: number; trail: Array<{lat: number; lon: number}> }) {
  const x = ((lon + 180) / 360) * 400;
  const y = ((90 - lat) / 180) * 200;

  // Build trail path
  const trailPath = trail.length > 1
    ? trail.map((p, i) => {
        const px = ((p.lon + 180) / 360) * 400;
        const py = ((90 - p.lat) / 180) * 200;
        return `${i === 0 ? "M" : "L"} ${px} ${py}`;
      }).join(" ")
    : null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-emerald-500/15 bg-slate-950">
      <svg viewBox="0 0 400 200" className="w-full" style={{ aspectRatio: "2/1" }}>
        {/* Ocean */}
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#050f22" />
            <stop offset="100%" stopColor="#020810" />
          </radialGradient>
          <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <rect width="400" height="200" fill="url(#oceanGrad)" />

        {/* Subtle star points */}
        {[[20,15],[60,8],[110,5],[200,3],[300,12],[350,7],[380,18],[15,45],[90,40],[240,38],[340,35]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r="0.6" fill="white" opacity="0.4" />
        ))}

        {/* Grid */}
        {[-60, -30, 0, 30, 60].map((lt) => {
          const gy = ((90 - lt) / 180) * 200;
          return <line key={lt} x1="0" y1={gy} x2="400" y2={gy} stroke="#0d2240" strokeWidth={lt === 0 ? "0.8" : "0.3"} />;
        })}
        {[-120, -60, 0, 60, 120].map((ln) => {
          const gx = ((ln + 180) / 360) * 400;
          return <line key={ln} x1={gx} y1="0" x2={gx} y2="200" stroke="#0d2240" strokeWidth="0.3" />;
        })}
        <line x1="0" y1="100" x2="400" y2="100" stroke="#0f2840" strokeWidth="0.6" />

        {/* Continents */}
        <path d="M60,35 L82,28 L97,38 L102,55 L92,76 L86,92 L74,96 L63,82 L54,70 L50,54Z" fill="#0c2240" stroke="#1a3a65" strokeWidth="0.6" />
        <path d="M79,96 L96,90 L108,102 L112,122 L106,148 L96,157 L84,150 L77,133 L74,112Z" fill="#0c2240" stroke="#1a3a65" strokeWidth="0.6" />
        <path d="M168,28 L192,24 L202,33 L196,46 L183,51 L168,46Z" fill="#0c2240" stroke="#1a3a65" strokeWidth="0.6" />
        <path d="M173,50 L202,44 L218,56 L222,82 L216,112 L205,127 L190,130 L177,122 L169,96 L167,70Z" fill="#0c2240" stroke="#1a3a65" strokeWidth="0.6" />
        <path d="M200,22 L262,18 L312,27 L332,40 L322,62 L297,72 L260,66 L233,72 L214,60 L200,44Z" fill="#0c2240" stroke="#1a3a65" strokeWidth="0.6" />
        <path d="M244,72 L276,68 L310,75 L330,88 L325,110 L305,122 L272,118 L248,100Z" fill="#0c2240" stroke="#1a3a65" strokeWidth="0.6" />
        <path d="M296,110 L332,104 L348,116 L350,132 L340,142 L315,144 L297,133Z" fill="#0c2240" stroke="#1a3a65" strokeWidth="0.6" />
        {/* Greenland */}
        <path d="M95,12 L115,8 L125,15 L122,28 L108,32 L95,25Z" fill="#0c2240" stroke="#1a3a65" strokeWidth="0.4" />

        {/* ISS orbit ellipse */}
        <ellipse cx="200" cy="100" rx="198" ry="57" fill="none" stroke="#10b981" strokeWidth="0.8"
          strokeDasharray="5 4" opacity="0.3" />

        {/* Trail */}
        {trailPath && (
          <path d={trailPath} fill="none" stroke="url(#trailGrad)" strokeWidth="1.5" opacity="0.5" />
        )}

        {/* ISS glow rings */}
        <circle cx={x} cy={y} r="14" fill="#10b981" opacity="0.06" />
        <circle cx={x} cy={y} r="9"  fill="#10b981" opacity="0.1" />
        <circle cx={x} cy={y} r="5"  fill="#10b981" opacity="0.3" />
        <circle cx={x} cy={y} r="3"  fill="#10b981" opacity="0.9" />
        <circle cx={x} cy={y} r="1.2" fill="white" />

        {/* ISS label */}
        <text x={Math.min(x + 8, 370)} y={Math.max(y - 8, 10)} fill="#10b981" fontSize="8" fontFamily="monospace" fontWeight="bold">
          ISS
        </text>

        {/* Coord labels */}
        <text x="2" y="198" fill="#1a3a65" fontSize="6" fontFamily="monospace">
          {latStr(lat)} · {lonStr(lon)}
        </text>
      </svg>

      <div className="absolute bottom-2 right-3 text-[9px] text-slate-700 font-mono">
        Equirectangular projection
      </div>
    </div>
  );
}

export default function ISSTracker() {
  const [position, setPosition] = useState<ISSPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [pass, setPass] = useState(0);
  const trail = useRef<Array<{ lat: number; lon: number }>>([]);

  const fetchPosition = useCallback(async () => {
    try {
      const res = await fetch("/api/iss");
      if (!res.ok) throw new Error("Failed");
      const data: ISSPosition = await res.json();
      setPosition(data);
      setLastUpdate(new Date());
      setPass((p) => p + 1);
      setError(null);
      // Keep last 20 positions for trail
      trail.current = [...trail.current.slice(-19), { lat: data.latitude, lon: data.longitude }];
    } catch {
      setError("Unable to reach ISS tracking service");
    }
  }, []);

  useEffect(() => {
    fetchPosition();
    const interval = setInterval(fetchPosition, 5000);
    return () => clearInterval(interval);
  }, [fetchPosition]);

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchPosition}
          className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="space-y-4">
        <div className="skeleton rounded-xl w-full" style={{ aspectRatio: "2/1" }} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Globe,        label: "Latitude",  value: latStr(position.latitude),               color: "text-emerald-400" },
    { icon: Globe,        label: "Longitude", value: lonStr(position.longitude),               color: "text-emerald-400" },
    { icon: ArrowUpRight, label: "Altitude",  value: `${position.altitude.toFixed(1)} km`,    color: "text-sky-400"     },
    { icon: Gauge,        label: "Velocity",  value: `${position.velocity.toFixed(0)} km/h`,  color: "text-amber-400"   },
  ];

  const orbitNumber = Math.floor((Date.now() / 1000 - 978307200) / (92 * 60)) % 100000;

  return (
    <div className="space-y-5">
      {/* Globe visualization */}
      <ISSGlobe lat={position.latitude} lon={position.longitude} trail={trail.current} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-2">
              <Icon size={11} />
              {label}
            </div>
            <div className={`text-base font-bold font-mono ${color} leading-tight`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className="glass-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Satellite size={14} className="text-emerald-400" />
          <span>International Space Station</span>
          <span className="text-slate-700">·</span>
          <span className="font-mono text-slate-600">NORAD 25544</span>
        </div>
        <div className="flex items-center gap-4 text-slate-600">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            <span className="font-mono">{lastUpdate?.toLocaleTimeString() ?? "—"}</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-500/60">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-twinkle-fast" />
            Poll #{pass}
          </span>
        </div>
      </div>

      {/* Orbital parameters */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Orbital period",    value: "~92 min",        note: "one complete orbit" },
          { label: "Daily orbits",      value: "~15.5",          note: "per 24-hour day"   },
          { label: "Inclination",       value: "51.6°",          note: "to the equator"    },
        ].map(({ label, value, note }) => (
          <div key={label} className="glass-card rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-emerald-400 data-readout">{value}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">{label}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{note}</div>
          </div>
        ))}
      </div>

      {/* Crew / mission info */}
      <div className="glass-card rounded-xl p-5 border-l-4 border-emerald-500/30">
        <div className="flex items-start gap-2">
          <Info size={13} className="text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-400 leading-relaxed space-y-1">
            <p>
              The ISS orbits at approximately <span className="text-emerald-400">408 km</span> altitude
              at a speed of <span className="text-emerald-400">7.66 km/s</span> (27,600 km/h).
              It completes one orbit every 92 minutes, meaning the crew experiences
              <span className="text-emerald-400"> 16 sunrises and sunsets per day</span>.
            </p>
            <p className="text-slate-600">
              Position data via <span className="text-sky-500">wheretheiss.at</span> ·
              Updates every 5 seconds · Orbit approximate (equatorial projection).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
