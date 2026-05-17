import Image from "next/image";
import { ExternalLink, Rocket } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

export interface LaunchData {
  id: string;
  name: string;
  date_utc: string;
  details: string | null;
  links: {
    patch?: { small?: string; large?: string } | null;
    webcast?: string | null;
    wikipedia?: string | null;
  };
  date_precision: string;
  upcoming: boolean;
  flight_number: number;
}

export default function LaunchCard({ launch }: { launch: LaunchData }) {
  const date = new Date(launch.date_utc);
  const dateStr = date.toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 hover:border-sky-500/20 transition-colors border border-slate-800/60">
      <div className="flex items-start gap-4">
        {/* Mission patch */}
        <div className="shrink-0 w-14 h-14 rounded-xl bg-slate-800/60 flex items-center justify-center border border-slate-700/50 overflow-hidden">
          {launch.links.patch?.small ? (
            <Image
              src={launch.links.patch.small}
              alt={`${launch.name} mission patch`}
              width={56}
              height={56}
              unoptimized
              className="object-contain p-1"
            />
          ) : (
            <Rocket size={22} className="text-slate-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-sky-400 font-mono">#{launch.flight_number}</span>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-medium uppercase tracking-wide">
              Upcoming
            </span>
          </div>
          <h3 className="text-white font-semibold text-sm leading-snug truncate">{launch.name}</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {dateStr} · {timeStr}
          </p>
        </div>
      </div>

      {/* Countdown */}
      <div className="bg-slate-900/50 rounded-xl px-4 py-3 border border-slate-800/40">
        <CountdownTimer targetDate={launch.date_utc} label="T-minus" />
      </div>

      {/* Details */}
      {launch.details && (
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{launch.details}</p>
      )}

      {/* Links */}
      {(launch.links.webcast || launch.links.wikipedia) && (
        <div className="flex gap-3 pt-1">
          {launch.links.webcast && (
            <a
              href={launch.links.webcast}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium"
            >
              <ExternalLink size={11} /> Watch webcast
            </a>
          )}
          {launch.links.wikipedia && (
            <a
              href={launch.links.wikipedia}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ExternalLink size={11} /> Wikipedia
            </a>
          )}
        </div>
      )}
    </div>
  );
}
