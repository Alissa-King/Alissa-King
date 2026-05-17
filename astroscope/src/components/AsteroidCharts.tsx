"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, CartesianGrid, Cell, Legend, ReferenceLine,
} from "recharts";

export interface AsteroidDataPoint {
  name: string;
  diameter: number;
  velocity: number;
  missMoon: number;
  hazardous: boolean;
}

interface Props {
  data: AsteroidDataPoint[];
}

const TooltipContent = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: AsteroidDataPoint }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card rounded-xl p-3 text-xs border border-slate-700 shadow-xl">
      <p className="font-semibold text-white mb-2 text-sm">{d.name}</p>
      <div className="space-y-1">
        <p className="text-amber-400">⌀ {d.diameter < 1 ? `${(d.diameter * 1000).toFixed(0)} m` : `${d.diameter.toFixed(3)} km`}</p>
        <p className="text-sky-400">↗ {d.velocity.toLocaleString()} km/h</p>
        <p className="text-emerald-400">⟷ {d.missMoon} lunar dist.</p>
        <p className={d.hazardous ? "text-red-400 font-semibold" : "text-green-400"}>
          {d.hazardous ? "⚠ Potentially hazardous" : "✓ Safe passage"}
        </p>
      </div>
    </div>
  );
};

export default function AsteroidCharts({ data }: Props) {
  const moonDist = 1; // 1 LD reference line

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Velocity bar chart */}
        <div className="glass-card rounded-2xl p-6">
          <div className="mb-1 text-sm font-semibold text-slate-300">Approach Velocity</div>
          <div className="mb-4 text-xs text-slate-600">Top 15 closest · km/h · red = potentially hazardous</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0d2240" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#475569", fontSize: 9 }}
                angle={-40}
                textAnchor="end"
                height={60}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#475569", fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<TooltipContent />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="velocity" radius={[3, 3, 0, 0]} maxBarSize={28}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.hazardous ? "#ef4444" : "#38bdf8"} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scatter: diameter vs miss distance */}
        <div className="glass-card rounded-2xl p-6">
          <div className="mb-1 text-sm font-semibold text-slate-300">Size vs. Miss Distance</div>
          <div className="mb-4 text-xs text-slate-600">Lunar distances (LD) · 1 LD = 384,400 km</div>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0d2240" />
              <XAxis
                dataKey="missMoon"
                name="Miss dist"
                tick={{ fill: "#475569", fontSize: 9 }}
                tickLine={false}
                label={{ value: "Miss distance (LD)", position: "insideBottom", offset: -8, fill: "#475569", fontSize: 9 }}
                height={40}
              />
              <YAxis
                dataKey="diameter"
                name="Diameter"
                tick={{ fill: "#475569", fontSize: 9 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<TooltipContent />} cursor={{ stroke: "#38bdf8", strokeWidth: 1, fill: "rgba(56,189,248,0.02)" }} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#64748b", paddingTop: 8 }}
                formatter={(v) => <span className="text-slate-500">{v}</span>}
              />
              <ReferenceLine x={1} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.5} />
              <Scatter name="Safe"       data={data.filter(d => !d.hazardous)} fill="#34d399" opacity={0.8} r={5} />
              <Scatter name="Hazardous"  data={data.filter(d =>  d.hazardous)} fill="#f87171" opacity={0.8} r={6} />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-amber-600 text-center mt-1">— yellow line = 1 lunar distance threshold</p>
        </div>
      </div>

      {/* Orbital simulation */}
      <div className="glass-card rounded-2xl p-6">
        <div className="mb-1 text-sm font-semibold text-slate-300">Relative Close-Approach Scale</div>
        <div className="mb-5 text-xs text-slate-600">
          Nearest {Math.min(data.length, 8)} asteroids — circle radius ∝ estimated diameter · position ∝ miss distance
        </div>
        <div className="relative overflow-hidden rounded-xl bg-slate-950/60" style={{ height: 200 }}>
          <svg width="100%" height="200" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid meet">
            {/* Earth */}
            <circle cx="60" cy="100" r="18" fill="#1d4ed8" opacity="0.9" />
            <circle cx="60" cy="100" r="18" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
            <text x="60" y="165" textAnchor="middle" fill="#3b82f6" fontSize="10" fontFamily="sans-serif">Earth</text>

            {/* Moon orbit reference */}
            <ellipse cx="60" cy="100" rx="120" ry="30" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
            <text x="183" y="104" fill="#f59e0b" fontSize="8" fontFamily="monospace" opacity="0.6">1 LD</text>

            {/* Asteroids */}
            {data.slice(0, 8).map((a, i) => {
              const scaledX = 60 + (a.missMoon / 10) * 700;
              const cy = 100 + (i % 3 - 1) * 40;
              const r = Math.max(3, Math.min(14, a.diameter * 20 + 3));
              const col = a.hazardous ? "#ef4444" : "#34d399";
              return (
                <g key={i}>
                  <line x1="60" y1="100" x2={scaledX} y2={cy} stroke={col} strokeWidth="0.4" opacity="0.2" strokeDasharray="3 3" />
                  <circle cx={scaledX} cy={cy} r={r} fill={col} opacity="0.75" />
                  <circle cx={scaledX} cy={cy} r={r} fill="none" stroke={col} strokeWidth="0.8" opacity="0.4" />
                  <text x={scaledX} y={cy + r + 12} textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
                    {a.missMoon.toFixed(1)}LD
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-2 right-3 text-[9px] text-slate-700 font-mono">
            not to scale · x-axis = miss distance · circle = relative size
          </div>
        </div>
      </div>
    </div>
  );
}
