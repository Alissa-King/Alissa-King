import { Suspense } from "react";
import ISSTracker from "@/components/ISSTracker";
import ISSCrew from "@/components/ISSCrew";
import { Satellite } from "lucide-react";

export const metadata = {
  title: "ISS Live Tracker — AstroScope",
  description: "Real-time International Space Station position tracking with live telemetry",
};

export default function ISSPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-twinkle-fast" />
          Live — updates every 5 seconds
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">ISS Live Tracker</h1>
        <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
          Real-time position of the International Space Station. At 408 km altitude orbiting at
          27,600 km/h, the ISS completes a full orbit every 92 minutes — crossing your sky
          multiple times each night as a fast-moving bright star.
        </p>
      </div>

      {/* Tracker */}
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="skeleton rounded-xl w-full" style={{ aspectRatio: "2/1" }} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          </div>
        }
      >
        <ISSTracker />
      </Suspense>

      {/* Crew Panel */}
      <div className="mt-8">
        <Suspense
          fallback={
            <div className="glass-card rounded-2xl p-6">
              <div className="skeleton h-4 w-40 rounded mb-4" />
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="skeleton h-3 w-32 rounded" />
                      <div className="skeleton h-2.5 w-24 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <ISSCrew />
        </Suspense>
      </div>

      {/* Spotting guide */}
      <div className="mt-10 grid sm:grid-cols-2 gap-5">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Satellite size={14} className="text-emerald-400" />
            Spotting the ISS
          </h3>
          <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
            <p>
              The ISS is the <span className="text-emerald-400 font-semibold">third-brightest object</span> in the
              night sky after the Moon and Venus — easily visible to the naked eye as a steady,
              fast-moving point of light (no blinking like an aircraft).
            </p>
            <p>
              Passes last 1–6 minutes and occur during the hours just after sunset or before
              sunrise, when the station is still illuminated by the Sun while your sky is dark.
              Look for it moving steadily from west to east.
            </p>
            <p className="text-slate-600">
              Use <span className="text-sky-400">spotthestation.nasa.gov</span> for precise
              pass predictions at your location.
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">ISS by the Numbers</h3>
          <div className="space-y-2">
            {[
              { label: "Assembly",         value: "1998–2011",        color: "text-slate-300" },
              { label: "Mass",             value: "420,000 kg",       color: "text-sky-400"     },
              { label: "Pressurized vol.", value: "915 m³",           color: "text-sky-400"     },
              { label: "Solar array span", value: "109 m",            color: "text-amber-400"   },
              { label: "Crew capacity",    value: "6–7 astronauts",   color: "text-emerald-400" },
              { label: "Continuous ops",   value: "Since Nov 2000",   color: "text-violet-400"  },
              { label: "Total orbits",     value: "~100,000+",        color: "text-emerald-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-800/40 last:border-0 text-xs">
                <span className="text-slate-500">{label}</span>
                <span className={`font-semibold data-readout ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
