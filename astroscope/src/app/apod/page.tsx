import { fetchApod, type ApodData } from "@/lib/nasa";
import { Calendar, Copyright, ExternalLink, Telescope, Info } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

export const metadata = {
  title: "Astronomy Picture of the Day — AstroScope",
  description: "NASA's iconic daily image — stunning photography and scientific imagery from across the universe",
};

async function ApodContent() {
  let apod: ApodData;
  try {
    apod = await fetchApod();
  } catch {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <Telescope size={40} className="text-violet-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Unable to load today&apos;s image</h2>
        <p className="text-slate-500 text-sm">NASA APOD API is temporarily unavailable. Try again shortly.</p>
      </div>
    );
  }

  const formatted = new Date(apod.date).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      {/* Title block */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">{apod.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-violet-400" />
            {formatted}
          </span>
          {apod.copyright && (
            <span className="flex items-center gap-1.5">
              <Copyright size={14} />
              {apod.copyright.replace(/\n/g, " ")}
            </span>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="rounded-2xl overflow-hidden border border-violet-500/15 mb-8 bg-slate-950 shadow-[0_0_60px_rgba(139,92,246,0.08)]">
        {apod.media_type === "image" ? (
          <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
            <Image
              src={apod.hdurl ?? apod.url}
              alt={apod.title}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        ) : (
          <div className="aspect-video">
            <iframe src={apod.url} className="w-full h-full" allowFullScreen title={apod.title} />
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="sm:col-span-2 glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4">
            <Info size={12} />
            About this image
          </div>
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{apod.explanation}</p>
          {apod.hdurl && (
            <a
              href={apod.hdurl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              View full-resolution image <ExternalLink size={14} />
            </a>
          )}
        </div>

        <div className="space-y-4">
          {/* Image meta */}
          <div className="glass-card rounded-2xl p-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Image Details</div>
            <div className="space-y-2">
              {[
                { label: "Date",       value: formatted           },
                { label: "Media type", value: apod.media_type === "image" ? "Photograph" : "Video" },
                ...(apod.copyright ? [{ label: "Credit", value: apod.copyright.replace(/\n/g, ", ") }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="text-xs">
                  <div className="text-slate-600">{label}</div>
                  <div className="text-slate-300 font-medium mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* About APOD */}
          <div className="glass-card rounded-2xl p-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">About APOD</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              The Astronomy Picture of the Day has been published every day since
              June 16, 1995 — a collaboration between NASA and Michigan Technological University.
              Each image is selected and explained by professional astronomers.
            </p>
            <a
              href="https://apod.nasa.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              apod.nasa.gov <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ApodPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-slow" />
          Astronomy Picture of the Day
        </div>
        <p className="text-slate-500 text-sm">NASA&apos;s iconic daily showcase — published every day since 1995</p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="skeleton h-10 w-2/3 rounded-lg" />
              <div className="skeleton h-4 w-1/3 rounded" />
            </div>
            <div className="skeleton rounded-2xl w-full" style={{ aspectRatio: "16/9" }} />
            <div className="grid sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2 glass-card rounded-2xl p-8 space-y-3">
                {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-4 rounded" />)}
              </div>
              <div className="space-y-4">
                <div className="skeleton h-32 rounded-2xl" />
                <div className="skeleton h-32 rounded-2xl" />
              </div>
            </div>
          </div>
        }
      >
        <ApodContent />
      </Suspense>
    </div>
  );
}
