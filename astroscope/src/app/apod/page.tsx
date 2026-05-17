import { fetchApod, type ApodData } from "@/lib/nasa";
import { Calendar, Copyright, ExternalLink, Telescope } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

export const metadata = {
  title: "APOD — AstroScope",
  description: "NASA Astronomy Picture of the Day",
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
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{apod.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
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

      <div className="rounded-2xl overflow-hidden border border-violet-500/20 mb-8 bg-slate-950">
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

      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">About this image</h2>
        <p className="text-slate-400 leading-relaxed text-sm sm:text-base">{apod.explanation}</p>
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
    </>
  );
}

export default function ApodPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
          Astronomy Picture of the Day
        </div>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 w-2/3 bg-slate-800 rounded-lg animate-pulse" />
            <div className="aspect-video bg-slate-900 rounded-2xl animate-pulse" />
            <div className="glass-card rounded-2xl p-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        }
      >
        <ApodContent />
      </Suspense>
    </div>
  );
}
