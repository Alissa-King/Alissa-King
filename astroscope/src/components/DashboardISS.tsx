"use client";

import { useEffect, useState, useCallback } from "react";
import { Satellite, Globe, Gauge, ArrowUpRight } from "lucide-react";
import type { ISSPosition } from "@/lib/nasa";

function latStr(lat: number) { return `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}`; }
function lonStr(lon: number) { return `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? "E" : "W"}`; }

function MiniGlobe({ lat, lon }: { lat: number; lon: number }) {
  const x = ((lon + 180) / 360) * 400;
  const y = ((90 - lat) / 180) * 200;

  return (
    <svg viewBox="0 0 400 200" className="w-full rounded-xl" style={{ aspectRatio: "2/1" }}>
      {/* Ocean */}
      <rect width="400" height="200" fill="#03070f" />

      {/* Grid */}
      {[-60, -30, 0, 30, 60].map((lt) => (
        <line key={lt} x1="0" y1={((90 - lt) / 180) * 200} x2="400" y2={((90 - lt) / 180) * 200}
          stroke="#0f2035" strokeWidth={lt === 0 ? "1" : "0.4"} />
      ))}
      {[-120, -60, 0, 60, 120].map((ln) => (
        <line key={ln} x1={((ln + 180) / 360) * 400} y1="0" x2={((ln + 180) / 360) * 400} y2="200"
          stroke="#0f2035" strokeWidth="0.4" />
      ))}

      {/* Continents — simplified */}
      <path d="M60,35 L82,28 L97,38 L102,55 L92,76 L86,92 L74,96 L63,82 L54,70 L50,54Z" fill="#0c2240" stroke="#164070" strokeWidth="0.5" />
      <path d="M79,96 L96,90 L108,102 L112,122 L106,148 L96,157 L84,150 L77,133 L74,112Z" fill="#0c2240" stroke="#164070" strokeWidth="0.5" />
      <path d="M168,28 L192,24 L202,33 L196,46 L183,51 L168,46Z" fill="#0c2240" stroke="#164070" strokeWidth="0.5" />
      <path d="M173,50 L202,44 L218,56 L222,82 L216,112 L205,127 L190,130 L177,122 L169,96 L167,70Z" fill="#0c2240" stroke="#164070" strokeWidth="0.5" />
      <path d="M200,22 L262,18 L312,27 L332,40 L322,62 L297,72 L260,66 L233,72 L214,60 L200,44Z" fill="#0c2240" stroke="#164070" strokeWidth="0.5" />
      <path d="M244,72 L276,68 L310,75 L330,88 L325,110 L305,122 L272,118 L248,100Z" fill="#0c2240" stroke="#164070" strokeWidth="0.5" />
      <path d="M296,110 L332,104 L348,116 L350,132 L340,142 L315,144 L297,133Z" fill="#0c2240" stroke="#164070" strokeWidth="0.5" />

      {/* ISS orbit trace */}
      <ellipse cx="200" cy="100" rx="198" ry="57" fill="none" stroke="#10b981" strokeWidth="0.6"
        strokeDasharray="5 4" opacity="0.35" />

      {/* ISS position pulse */}
      <circle cx={x} cy={y} r="10" fill="#10b981" opacity="0.1" />
      <circle cx={x} cy={y} r="6"  fill="#10b981" opacity="0.2" />
      <circle cx={x} cy={y} r="3.5" fill="#10b981" opacity="0.9" />
      <circle cx={x} cy={y} r="1.5" fill="white" />

      {/* Label */}
      <text x={Math.min(x + 7, 380)} y={Math.max(y - 6, 12)} fill="#10b981" fontSize="7" fontFamily="monospace" fontWeight="bold">
        ISS
      </text>
    </svg>
  );
}

export default function DashboardISS() {
  const [position, setPosition] = useState<ISSPosition | null>(null);
  const [error, setError] = useState(false);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch("/api/iss");
      if (!res.ok) throw new Error();
      setPosition(await res.json());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, 5000);
    return () => clearInterval(id);
  }, [fetch_]);

  if (error) return (
    <div className="glass-card rounded-2xl p-6 flex items-center justify-center text-slate-600 text-sm h-full min-h-[180px]">
      ISS signal lost
    </div>
  );

  if (!position) return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="skeleton w-full" style={{ aspectRatio: "2/1" }} />
      <div className="p-4 grid grid-cols-2 gap-2">
        {[1, 2].map((i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
      </div>
    </div>
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Map */}
      <div className="border-b border-slate-800/50">
        <MiniGlobe lat={position.latitude} lon={position.longitude} />
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="space-y-0.5">
          <div className="text-[10px] text-slate-600 flex items-center gap-1"><Globe size={9} /> Position</div>
          <div className="text-xs font-semibold text-emerald-400 data-readout">{latStr(position.latitude)}</div>
          <div className="text-xs font-semibold text-emerald-400 data-readout">{lonStr(position.longitude)}</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] text-slate-600 flex items-center gap-1"><ArrowUpRight size={9} /> Altitude</div>
          <div className="text-xs font-semibold text-sky-400 data-readout">{position.altitude.toFixed(1)} km</div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
            <Gauge size={9} />{position.velocity.toFixed(0)} km/h
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 flex items-center gap-1.5 text-[10px] text-emerald-500">
        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-twinkle-fast" />
        <Satellite size={9} />
        Live · updates every 5s
      </div>
    </div>
  );
}
