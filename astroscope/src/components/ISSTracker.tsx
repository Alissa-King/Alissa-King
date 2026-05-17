"use client";

import { useEffect, useState, useCallback } from "react";
import { Satellite, Gauge, ArrowUpRight, Clock, Globe } from "lucide-react";
import type { ISSPosition } from "@/lib/nasa";

function latStr(lat: number) {
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`;
}
function lonStr(lon: number) {
  return `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? "E" : "W"}`;
}

function ISSGlobe({ lat, lon }: { lat: number; lon: number }) {
  // Map lat/lon to SVG coordinates on a 400x200 equirectangular projection
  const x = ((lon + 180) / 360) * 400;
  const y = ((90 - lat) / 180) * 200;

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-emerald-500/20 bg-slate-950">
      <svg
        viewBox="0 0 400 200"
        className="w-full"
        style={{ aspectRatio: "2/1" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ocean */}
        <rect width="400" height="200" fill="#050a14" />

        {/* Grid lines */}
        {[-60, -30, 0, 30, 60].map((lat) => {
          const y = ((90 - lat) / 180) * 200;
          return (
            <line
              key={lat}
              x1="0"
              y1={y}
              x2="400"
              y2={y}
              stroke="#1e3a5f"
              strokeWidth="0.5"
            />
          );
        })}
        {[-120, -60, 0, 60, 120].map((lon) => {
          const x = ((lon + 180) / 360) * 400;
          return (
            <line
              key={lon}
              x1={x}
              y1="0"
              x2={x}
              y2="200"
              stroke="#1e3a5f"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Equator highlight */}
        <line x1="0" y1="100" x2="400" y2="100" stroke="#1e3a5f" strokeWidth="1" />

        {/* Simplified continental outlines (very rough) */}
        {/* North America */}
        <path
          d="M60,35 L80,30 L95,38 L100,55 L90,75 L85,90 L75,95 L65,80 L55,70 L50,55 Z"
          fill="#0d2a47"
          stroke="#1e4d80"
          strokeWidth="0.5"
        />
        {/* South America */}
        <path
          d="M80,95 L95,90 L105,100 L110,120 L105,145 L95,155 L85,148 L78,130 L75,110 Z"
          fill="#0d2a47"
          stroke="#1e4d80"
          strokeWidth="0.5"
        />
        {/* Europe */}
        <path
          d="M170,28 L190,25 L200,32 L195,45 L182,50 L170,45 Z"
          fill="#0d2a47"
          stroke="#1e4d80"
          strokeWidth="0.5"
        />
        {/* Africa */}
        <path
          d="M175,50 L200,45 L215,55 L220,80 L215,110 L205,125 L190,128 L178,120 L170,95 L168,70 Z"
          fill="#0d2a47"
          stroke="#1e4d80"
          strokeWidth="0.5"
        />
        {/* Asia */}
        <path
          d="M200,25 L260,20 L310,28 L330,40 L320,60 L295,70 L260,65 L235,70 L215,58 L200,45 Z"
          fill="#0d2a47"
          stroke="#1e4d80"
          strokeWidth="0.5"
        />
        {/* Australia */}
        <path
          d="M295,110 L330,105 L345,115 L348,130 L338,140 L315,142 L298,132 Z"
          fill="#0d2a47"
          stroke="#1e4d80"
          strokeWidth="0.5"
        />

        {/* ISS orbit path (simplified ellipse at ISS inclination ~51.6°) */}
        <ellipse
          cx="200"
          cy="100"
          rx="198"
          ry="57"
          fill="none"
          stroke="#34d399"
          strokeWidth="0.8"
          strokeDasharray="4 3"
          opacity="0.4"
        />

        {/* ISS position marker */}
        <circle cx={x} cy={y} r="6" fill="#34d399" opacity="0.25" />
        <circle cx={x} cy={y} r="3.5" fill="#34d399" />
        <circle cx={x} cy={y} r="1.5" fill="white" />

        {/* Label */}
        <text
          x={x + 8}
          y={y - 8}
          fill="#34d399"
          fontSize="8"
          fontFamily="monospace"
          fontWeight="bold"
        >
          ISS
        </text>
      </svg>
      <div className="absolute bottom-2 right-3 text-xs text-slate-600 font-mono">
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

  const fetchPosition = useCallback(async () => {
    try {
      const res = await fetch("/api/iss");
      if (!res.ok) throw new Error("Failed");
      const data: ISSPosition = await res.json();
      setPosition(data);
      setLastUpdate(new Date());
      setPass((p) => p + 1);
      setError(null);
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
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchPosition}
          className="mt-4 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center text-slate-500 animate-pulse">
        Acquiring ISS signal...
      </div>
    );
  }

  const stats = [
    {
      icon: Globe,
      label: "Latitude",
      value: latStr(position.latitude),
      color: "text-emerald-400",
    },
    {
      icon: Globe,
      label: "Longitude",
      value: lonStr(position.longitude),
      color: "text-emerald-400",
    },
    {
      icon: ArrowUpRight,
      label: "Altitude",
      value: `${position.altitude.toFixed(1)} km`,
      color: "text-sky-400",
    },
    {
      icon: Gauge,
      label: "Velocity",
      value: `${(position.velocity).toFixed(0)} km/h`,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Globe visualization */}
      <ISSGlobe lat={position.latitude} lon={position.longitude} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-2">
              <Icon size={12} />
              {label}
            </div>
            <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Meta */}
      <div className="glass-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <Satellite size={16} className="text-emerald-400" />
          International Space Station — NORAD ID 25544
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {lastUpdate?.toLocaleTimeString() ?? "—"}
          </span>
          <span className="text-emerald-500/60">
            Poll #{pass}
          </span>
        </div>
      </div>

      {/* Orbital facts */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Orbital period", value: "~92 min" },
          { label: "Orbits per day", value: "~15.5" },
          { label: "Inclination", value: "51.6°" },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-emerald-400">{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
