import { fetchArtemisPhotos } from "@/lib/nasa";
import Image from "next/image";
import { ExternalLink, Moon } from "lucide-react";
import { Suspense } from "react";

export const metadata = {
  title: "Artemis II Gallery — AstroScope",
  description: "Official NASA photography from the 2026 Artemis II crewed lunar flyby mission",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

async function ArtemisPhotos() {
  let result;
  try {
    result = await fetchArtemisPhotos(1);
  } catch {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <Moon size={40} className="text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 mb-2">NASA Image Library temporarily unavailable</p>
        <p className="text-slate-600 text-sm">
          Check{" "}
          <a
            href="https://eol.jsc.nasa.gov/Collections/Artemis/Artemis2/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-500 hover:text-sky-400"
          >
            eol.jsc.nasa.gov
          </a>{" "}
          for the full 12,000+ crew photo archive.
        </p>
      </div>
    );
  }

  const items = result?.items ?? [];
  const totalHits = result?.totalHits ?? 0;

  return (
    <>
      {totalHits > 0 && (
        <p className="text-slate-500 text-sm mb-6">
          <span className="text-sky-400 font-semibold">{totalHits.toLocaleString()}</span> total results from NASA
        </p>
      )}
      {items.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Moon size={40} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No photos indexed yet — check back soon as NASA processes the mission archive.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {items.map((photo) => (
            <div
              key={photo.nasa_id}
              className="break-inside-avoid group glass-card rounded-xl overflow-hidden border border-slate-800/60 hover:border-sky-500/40 transition-all duration-300"
            >
              <a href={photo.largeUrl} target="_blank" rel="noopener noreferrer">
                <div className="relative overflow-hidden bg-slate-950">
                  <Image
                    src={photo.thumbnail}
                    alt={photo.title}
                    width={400}
                    height={300}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-xs text-white font-medium flex items-center gap-1">
                      <ExternalLink size={10} /> View full size
                    </span>
                  </div>
                </div>
              </a>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-200 mb-1 line-clamp-2">{photo.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-2">{photo.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{formatDate(photo.date_created)}</span>
                  {photo.center && <span className="text-sky-600">{photo.center}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function ArtemisPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-medium mb-4">
          <Moon size={12} />
          Artemis II — Lunar Flyby, April 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Artemis II Mission Gallery
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Official NASA photography from humanity&apos;s first crewed journey to the Moon since Apollo 17.
          The crew flew within 9,200 km of the lunar surface, capturing the far side for the first time
          in over 50 years.
        </p>
        <a
          href="https://www.nasa.gov/artemis-ii-multimedia/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-sm text-sky-400 hover:text-sky-300 transition-colors"
        >
          NASA Artemis II Multimedia <ExternalLink size={12} />
        </a>
      </div>

      {/* Mission facts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Mission", value: "Artemis II" },
          { label: "Launch", value: "Apr 2026" },
          { label: "Crew", value: "4 astronauts" },
          { label: "Closest approach", value: "9,200 km" },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-sky-400">{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Gallery - streamed */}
      <Suspense
        fallback={
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl aspect-video animate-pulse" />
            ))}
          </div>
        }
      >
        <ArtemisPhotos />
      </Suspense>

      {/* Alternate source notice */}
      <div className="mt-10 glass-card rounded-xl p-5 border-l-4 border-sky-500/40">
        <p className="text-sm text-slate-400">
          <span className="text-sky-400 font-semibold">12,000+ crew photos available</span> — The
          Gateway to Astronaut Photography at JSC hosts the complete Artemis II collection,
          including high-resolution far-side moon imagery captured with Nikon D5, Nikon Z9, and iPhone 17.
        </p>
        <a
          href="https://eol.jsc.nasa.gov/Collections/Artemis/Artemis2/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm text-sky-400 hover:text-sky-300 transition-colors font-medium"
        >
          Browse full collection at eol.jsc.nasa.gov <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
