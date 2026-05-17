import { fetchAsteroidFeed, type NeoObject } from "@/lib/nasa";
import { AlertTriangle, CheckCircle2, Orbit } from "lucide-react";
import AsteroidCharts from "@/components/AsteroidCharts";
import { Suspense } from "react";

export const metadata = {
  title: "Asteroid Tracker — AstroScope",
  description: "7-day near-Earth asteroid feed from NASA NeoWs",
};

function formatKm(val: number) {
  return val >= 1 ? `${val.toFixed(2)} km` : `${(val * 1000).toFixed(0)} m`;
}

async function AsteroidContent() {
  let feed;
  try {
    feed = await fetchAsteroidFeed();
  } catch {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <Orbit size={40} className="text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Asteroid data unavailable</h2>
        <p className="text-slate-500 text-sm">NASA NeoWs API is temporarily unreachable. Try again shortly.</p>
      </div>
    );
  }

  const allAsteroids: NeoObject[] = Object.values(feed.near_earth_objects).flat();
  const hazardous = allAsteroids.filter((a) => a.is_potentially_hazardous_asteroid);
  const safe = allAsteroids.filter((a) => !a.is_potentially_hazardous_asteroid);

  const sorted = [...allAsteroids].sort((a, b) => {
    const distA = parseFloat(a.close_approach_data[0]?.miss_distance.kilometers ?? "Infinity");
    const distB = parseFloat(b.close_approach_data[0]?.miss_distance.kilometers ?? "Infinity");
    return distA - distB;
  });

  const chartData = sorted.slice(0, 15).map((a) => ({
    name: a.name.replace(/[()]/g, "").trim().slice(0, 20),
    diameter: parseFloat(
      ((a.estimated_diameter.kilometers.estimated_diameter_min +
        a.estimated_diameter.kilometers.estimated_diameter_max) /
        2
      ).toFixed(3)
    ),
    velocity: parseFloat(
      parseFloat(a.close_approach_data[0]?.relative_velocity.kilometers_per_hour ?? "0").toFixed(0)
    ),
    missMoon: parseFloat(
      parseFloat(a.close_approach_data[0]?.miss_distance.lunar ?? "0").toFixed(2)
    ),
    hazardous: a.is_potentially_hazardous_asteroid,
  }));

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total approaching", value: feed.element_count, color: "text-amber-400" },
          { label: "Potentially hazardous", value: hazardous.length, color: "text-red-400" },
          { label: "Confirmed safe", value: safe.length, color: "text-emerald-400" },
          { label: "Days tracked", value: 7, color: "text-sky-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-xl p-4 text-center">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <AsteroidCharts data={chartData} />

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Orbit size={18} className="text-amber-400" />
          Closest Approaches
        </h2>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-right px-4 py-3">Diameter (avg)</th>
                  <th className="text-right px-4 py-3">Velocity (km/h)</th>
                  <th className="text-right px-4 py-3">Miss dist (lunar)</th>
                  <th className="text-right px-4 py-3">Date</th>
                  <th className="text-center px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.slice(0, 25).map((a, i) => {
                  const approach = a.close_approach_data[0];
                  const avgDiam =
                    (a.estimated_diameter.kilometers.estimated_diameter_min +
                      a.estimated_diameter.kilometers.estimated_diameter_max) /
                    2;
                  return (
                    <tr
                      key={a.id}
                      className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                        i % 2 === 0 ? "bg-transparent" : "bg-slate-900/20"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-200">
                        <a
                          href={a.nasa_jpl_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-amber-400 transition-colors"
                        >
                          {a.name.replace(/[()]/g, "").trim()}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400 font-mono">{formatKm(avgDiam)}</td>
                      <td className="px-4 py-3 text-right text-slate-400 font-mono">
                        {approach
                          ? parseInt(approach.relative_velocity.kilometers_per_hour).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400 font-mono">
                        {approach ? parseFloat(approach.miss_distance.lunar).toFixed(2) + " LD" : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 text-xs">
                        {approach?.close_approach_date ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {a.is_potentially_hazardous_asteroid ? (
                          <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                            <AlertTriangle size={12} /> Hazardous
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                            <CheckCircle2 size={12} /> Safe
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AsteroidsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-slow inline-block" />
          Near-Earth Objects — 7-day window
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Asteroid Tracker</h1>
        <p className="text-slate-400">Real-time data from NASA&apos;s Near Earth Object Web Service (NeoWs)</p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card rounded-xl p-4 h-20 animate-pulse" />
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl h-64 animate-pulse" />
              <div className="glass-card rounded-2xl h-64 animate-pulse" />
            </div>
          </div>
        }
      >
        <AsteroidContent />
      </Suspense>
    </div>
  );
}
