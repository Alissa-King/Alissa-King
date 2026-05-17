"use client";

import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
}

function calculateTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, past: false };
}

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
  compact?: boolean;
}

function Digit({ value, unit }: { value: number; unit: string }) {
  const str = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-2xl font-bold text-white tabular-nums tracking-tight leading-none">
        {str}
      </span>
      <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">{unit}</span>
    </div>
  );
}

export default function CountdownTimer({ targetDate, label, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    if (timeLeft.past) return;
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, timeLeft.past]);

  if (timeLeft.past) {
    return (
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          Launched
        </span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="font-mono text-sm text-slate-300 tabular-nums">
        {timeLeft.days}d {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">{label}</p>
      )}
      <div className="flex items-end gap-3">
        <Digit value={timeLeft.days} unit="days" />
        <span className="text-slate-600 font-mono text-xl mb-4 leading-none">:</span>
        <Digit value={timeLeft.hours} unit="hrs" />
        <span className="text-slate-600 font-mono text-xl mb-4 leading-none">:</span>
        <Digit value={timeLeft.minutes} unit="min" />
        <span className="text-slate-600 font-mono text-xl mb-4 leading-none">:</span>
        <Digit value={timeLeft.seconds} unit="sec" />
      </div>
    </div>
  );
}
