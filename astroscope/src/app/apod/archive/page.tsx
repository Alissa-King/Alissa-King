import { Suspense } from "react";
import APODArchiveGrid from "@/components/APODArchiveGrid";
import { Telescope } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "APOD Archive — AstroScope",
  description: "Browse NASA's Astronomy Picture of the Day archive with date range selector",
};

export default function ApodArchivePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium mb-4">
          <Telescope size={11} />
          APOD Archive
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Picture of the Day{" "}
              <span className="text-violet-400">Archive</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Explore NASA&apos;s iconic astronomy images by date range. Click any image to view the
              full photograph and explanation from professional astronomers.
            </p>
          </div>
          <Link
            href="/apod"
            className="shrink-0 text-xs text-violet-400 hover:text-violet-300 border border-violet-500/30 hover:border-violet-500/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            ← Today&apos;s APOD
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="skeleton h-20 rounded-2xl" />
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="skeleton rounded-xl mb-4 break-inside-avoid" style={{ height: `${180 + (i % 3) * 60}px` }} />
              ))}
            </div>
          </div>
        }
      >
        <APODArchiveGrid />
      </Suspense>
    </div>
  );
}
