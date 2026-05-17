import { Suspense } from "react";
import { Rocket } from "lucide-react";
import LaunchCard, { type LaunchData } from "@/components/LaunchCard";
import CountdownTimer from "@/components/CountdownTimer";

export const metadata = {
  title: "Upcoming Launches — AstroScope",
  description: "Countdown timers for upcoming SpaceX launches and major astronomical events",
};

const ASTRO_EVENTS = [
  { label: "Total Lunar Eclipse",  date: "2026-03-03", color: "amber"   as const },
  { label: "Total Solar Eclipse",  date: "2026-08-12", color: "violet"  as const },
  { label: "Perseid Meteor Shower Peak", date: "2026-08-12", color: "sky" as const },
];

const colorMap = {
  amber:  { badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",  header: "text-amber-400" },
  violet: { badge: "border-violet-500/30 bg-violet-500/10 text-violet-400", header: "text-violet-400" },
  sky:    { badge: "border-sky-500/30 bg-sky-500/10 text-sky-400",         header: "text-sky-400" },
};

async function LaunchesContent() {
  const { connection } = await import("next/server");
  await connection();

  let launches: LaunchData[] = [];
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/launches`, { next: { revalidate: 3600 } });
    if (res.ok) launches = await res.json();
  } catch {
    // fallback to empty
  }

  return (
    <div className="space-y-10">
      {/* SpaceX Launches */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-white">SpaceX Upcoming Launches</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-medium uppercase tracking-wide">
            Next {launches.length}
          </span>
        </div>

        {launches.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <Rocket size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Launch data temporarily unavailable.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {launches.map((launch) => (
              <LaunchCard key={launch.id} launch={launch} />
            ))}
          </div>
        )}
      </section>

      {/* Astronomical Event Countdowns */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6">Astronomical Events</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {ASTRO_EVENTS.map(({ label, date, color }) => {
            const c = colorMap[color];
            return (
              <div key={label} className="glass-card rounded-2xl p-6 space-y-4">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium ${c.badge}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current pulse-slow" />
                  {date}
                </div>
                <h3 className={`font-semibold text-sm ${c.header}`}>{label}</h3>
                <CountdownTimer targetDate={date} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function LaunchesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-medium mb-4">
          <Rocket size={11} />
          Live Countdowns
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Launch <span className="text-sky-400">Tracker</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
          Real-time countdown timers for upcoming SpaceX missions and major astronomical events.
          Data from SpaceX API — refreshed hourly.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="skeleton h-8 w-48 rounded" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
              </div>
            </div>
            <div className="space-y-4">
              <div className="skeleton h-8 w-48 rounded" />
              <div className="grid sm:grid-cols-3 gap-5">
                {[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
              </div>
            </div>
          </div>
        }
      >
        <LaunchesContent />
      </Suspense>
    </div>
  );
}
