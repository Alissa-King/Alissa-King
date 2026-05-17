import { Suspense } from "react";
import StarChartGenerator from "@/components/StarChartGenerator";
import { Star } from "lucide-react";

export const metadata = {
  title: "Star Chart Generator — AstroScope",
  description: "Generate a custom star chart for any location, date, and time — printable sky map",
};

export default function StarChartPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <Star size={11} />
          Custom Sky Chart
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Star Chart <span className="text-indigo-400">Generator</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
          Generate a custom star chart for any location on Earth at any date and time. Set your
          coordinates, choose a moment in time, and render your personal view of the night sky.
          Print or save as PDF for field use.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="skeleton h-40 rounded-2xl" />
            <div className="flex justify-center">
              <div className="skeleton rounded-full" style={{ width: 500, height: 500 }} />
            </div>
          </div>
        }
      >
        <StarChartGenerator />
      </Suspense>

      {/* Tips */}
      <div className="mt-10 grid sm:grid-cols-2 gap-5">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-3">How to use</h3>
          <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
            <li className="flex gap-2"><span className="text-sky-400">1.</span> Enter your latitude and longitude (positive = N/E, negative = S/W)</li>
            <li className="flex gap-2"><span className="text-sky-400">2.</span> Select a date and time in your local timezone</li>
            <li className="flex gap-2"><span className="text-sky-400">3.</span> Click Generate Chart to render the sky</li>
            <li className="flex gap-2"><span className="text-sky-400">4.</span> Use Print / Save as PDF to export for stargazing</li>
          </ul>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-3">Chart notes</h3>
          <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
            <li className="flex gap-2"><span className="text-indigo-400">·</span> Chart shows stars down to magnitude ~4, with named bright stars labeled</li>
            <li className="flex gap-2"><span className="text-indigo-400">·</span> North is up — the view is as if lying on your back looking straight up</li>
            <li className="flex gap-2"><span className="text-indigo-400">·</span> Dashed circles mark 30° and 60° altitude rings</li>
            <li className="flex gap-2"><span className="text-indigo-400">·</span> Local Sidereal Time (LST) shown when chart is generated</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
