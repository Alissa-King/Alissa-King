import { Suspense } from "react";
import ISSTracker from "@/components/ISSTracker";

export const metadata = {
  title: "ISS Live Tracker — AstroScope",
  description: "Real-time International Space Station position tracking",
};

export default function ISSPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-slow inline-block" />
          Live — updates every 5 seconds
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          ISS Live Tracker
        </h1>
        <p className="text-slate-400">
          Real-time position of the International Space Station orbiting at ~28,000 km/h
        </p>
      </div>
      <Suspense
        fallback={
          <div className="glass-card rounded-2xl p-12 text-center text-slate-500 animate-pulse">
            Acquiring ISS signal...
          </div>
        }
      >
        <ISSTracker />
      </Suspense>
    </div>
  );
}
