"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ExternalLink, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface ApodItem {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  date: string;
  media_type: "image" | "video";
  copyright?: string;
  thumbnail_url?: string;
}

function getDefaultDates() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export default function APODArchiveGrid() {
  const defaults = getDefaultDates();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [items, setItems] = useState<ApodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ApodItem | null>(null);
  const [modalIdx, setModalIdx] = useState<number>(-1);

  const fetchArchive = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/apod-archive?start=${startDate}&end=${endDate}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: ApodItem[] = await res.json();
      // Sort descending (newest first)
      const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
      setItems(sorted);
    } catch {
      setError("Failed to load APOD archive. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchArchive();
  }, [fetchArchive]);

  const openModal = (item: ApodItem, idx: number) => {
    setModal(item);
    setModalIdx(idx);
  };

  const closeModal = () => {
    setModal(null);
    setModalIdx(-1);
  };

  const navigateModal = (dir: 1 | -1) => {
    const newIdx = modalIdx + dir;
    if (newIdx >= 0 && newIdx < items.length) {
      setModal(items[newIdx]);
      setModalIdx(newIdx);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="glass-card rounded-2xl p-5 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Start Date</label>
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-800/60 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500/60 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">End Date</label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-800/60 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500/60 transition-colors"
          />
        </div>
        <button
          onClick={fetchArchive}
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          {loading ? "Loading..." : "Browse"}
        </button>
        {items.length > 0 && (
          <span className="text-xs text-slate-500 font-mono ml-auto">
            {items.length} images
          </span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-card rounded-2xl p-8 text-center text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="skeleton rounded-xl break-inside-avoid mb-4"
              style={{ height: `${180 + (i % 3) * 60}px` }}
            />
          ))}
        </div>
      )}

      {/* Masonry grid */}
      {!loading && items.length > 0 && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {items.map((item, idx) => {
            const imgSrc = item.media_type === "image"
              ? (item.thumbnail_url ?? item.url)
              : (item.thumbnail_url ?? null);

            return (
              <div
                key={item.date}
                className="break-inside-avoid mb-4 group relative cursor-pointer rounded-xl overflow-hidden border border-slate-800/60 hover:border-violet-500/40 transition-all duration-300 bg-slate-900/60"
                onClick={() => openModal(item, idx)}
              >
                {imgSrc ? (
                  <div className="relative w-full" style={{ minHeight: "150px" }}>
                    <Image
                      src={imgSrc}
                      alt={item.title}
                      width={400}
                      height={300}
                      unoptimized
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center bg-slate-800/60 text-slate-500 text-xs py-12">
                    Video
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                  <p className="text-white text-sm font-semibold leading-tight">{item.title}</p>
                  <p className="text-violet-400 text-xs mt-1 flex items-center gap-1">
                    <Calendar size={10} />
                    {item.date}
                  </p>
                </div>

                {/* Always-visible bottom strip */}
                <div className="p-3 bg-slate-950/60 border-t border-slate-800/40">
                  <p className="text-slate-200 text-xs font-medium leading-snug line-clamp-1">{item.title}</p>
                  <p className="text-slate-600 text-[10px] mt-0.5 font-mono">{item.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-slate-500 text-sm">No images found for this date range.</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative bg-slate-950 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-800/60">
              <div>
                <h2 className="text-white font-semibold text-lg leading-tight">{modal.title}</h2>
                <p className="text-violet-400 text-xs mt-1 flex items-center gap-1">
                  <Calendar size={11} />
                  {modal.date}
                  {modal.copyright && <span className="text-slate-600 ml-2">© {modal.copyright.replace(/\n/g, " ")}</span>}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal image */}
            <div className="relative bg-slate-900/40">
              {modal.media_type === "image" ? (
                <Image
                  src={modal.hdurl ?? modal.url}
                  alt={modal.title}
                  width={1200}
                  height={800}
                  unoptimized
                  className="w-full h-auto max-h-[50vh] object-contain"
                />
              ) : (
                <div className="aspect-video">
                  <iframe src={modal.url} className="w-full h-full" allowFullScreen title={modal.title} />
                </div>
              )}
            </div>

            {/* Explanation */}
            <div className="p-5 space-y-4">
              <p className="text-slate-300 text-sm leading-relaxed">{modal.explanation}</p>
              {modal.hdurl && (
                <a
                  href={modal.hdurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Full resolution <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-5 pb-5 border-t border-slate-800/40 pt-4">
              <button
                onClick={() => navigateModal(-1)}
                disabled={modalIdx <= 0}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={14} /> Newer
              </button>
              <span className="text-xs text-slate-600 font-mono">{modalIdx + 1} / {items.length}</span>
              <button
                onClick={() => navigateModal(1)}
                disabled={modalIdx >= items.length - 1}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                Older <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
