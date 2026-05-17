"use client";

import { useState, useEffect } from "react";
import { Users, Satellite } from "lucide-react";

interface CrewMember {
  name: string;
  craft: string;
}

const AVATAR_COLORS = [
  "bg-sky-500/20 text-sky-300 border-sky-500/40",
  "bg-violet-500/20 text-violet-300 border-violet-500/40",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  "bg-amber-500/20 text-amber-300 border-amber-500/40",
  "bg-rose-500/20 text-rose-300 border-rose-500/40",
  "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
];

const FUN_FACTS = [
  "Astronauts can grow up to 2 inches taller in space due to spine decompression.",
  "On the ISS, the Sun rises and sets every 45 minutes — 16 times per day.",
  "Drinking water on the ISS is recycled from sweat, breath moisture, and urine.",
  "Astronauts must exercise 2.5 hours daily to counter muscle and bone loss.",
  "The ISS travels at 17,500 mph — fast enough to circle Earth in 92 minutes.",
  "Food is specially prepared and often eaten from packets to prevent crumbs floating.",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ISSCrew() {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [factIdx] = useState(() => Math.floor(Math.random() * FUN_FACTS.length));

  useEffect(() => {
    fetch("/api/crew")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCrew(data.crew);
      })
      .catch(() => setError("Unable to load crew data."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users size={14} className="text-emerald-400" />
          Current ISS Crew
        </h3>
        {!loading && crew.length > 0 && (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold tracking-wide">
            {crew.length} in orbit
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3 w-32 rounded" />
                <div className="skeleton h-2.5 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs py-2">{error}</p>
      )}

      {/* Crew list */}
      {!loading && crew.length > 0 && (
        <div className="space-y-3">
          {crew.map((member, i) => (
            <div
              key={member.name}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/40 transition-colors"
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
              >
                {getInitials(member.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-medium truncate">{member.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Satellite size={9} className="text-emerald-400 shrink-0" />
                  <span className="text-[10px] text-emerald-400 font-medium">Currently in orbit</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fun fact */}
      <div className="border-t border-slate-800/50 pt-4">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Did you know?</p>
        <p className="text-xs text-slate-400 leading-relaxed">{FUN_FACTS[factIdx]}</p>
      </div>
    </div>
  );
}
