"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";

interface AsteroidDataPoint {
  name: string;
  diameter: number;
  velocity: number;
  missMoon: number;
  hazardous: boolean;
}

interface Props {
  data: AsteroidDataPoint[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number | string; payload: AsteroidDataPoint }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card rounded-lg p-3 text-xs border border-slate-700">
      <p className="font-semibold text-white mb-1">{d.name}</p>
      <p className="text-amber-400">Diameter: {d.diameter} km</p>
      <p className="text-sky-400">Velocity: {d.velocity.toLocaleString()} km/h</p>
      <p className="text-emerald-400">Miss distance: {d.missMoon} LD</p>
      <p className={d.hazardous ? "text-red-400" : "text-green-400"}>
        {d.hazardous ? "⚠ Potentially hazardous" : "✓ Safe"}
      </p>
    </div>
  );
};

export default function AsteroidCharts({ data }: Props) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Velocity bar chart */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">
          Approach Velocity (km/h) — 15 Closest
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#64748b", fontSize: 10 }}
              angle={-35}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="velocity" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.hazardous ? "#f87171" : "#38bdf8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-600 mt-2 text-center">
          Red = potentially hazardous
        </p>
      </div>

      {/* Scatter: diameter vs miss distance */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">
          Size vs. Miss Distance (Lunar Distances)
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <ScatterChart margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
            <XAxis
              dataKey="missMoon"
              name="Miss distance (LD)"
              tick={{ fill: "#64748b", fontSize: 10 }}
              label={{ value: "Miss dist (LD)", position: "insideBottom", offset: -5, fill: "#64748b", fontSize: 10 }}
              height={40}
            />
            <YAxis
              dataKey="diameter"
              name="Diameter"
              tick={{ fill: "#64748b", fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#38bdf8", strokeWidth: 1 }} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#64748b" }}
            />
            <Scatter
              name="Safe"
              data={data.filter((d) => !d.hazardous)}
              fill="#34d399"
              opacity={0.8}
            />
            <Scatter
              name="Hazardous"
              data={data.filter((d) => d.hazardous)}
              fill="#f87171"
              opacity={0.8}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
