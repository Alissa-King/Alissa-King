"use client";

import { useMemo } from "react";

interface MoonData {
  fraction: number;
  name: string;
  illumination: number;
  emoji: string;
  daysUntilFull: number;
  daysUntilNew: number;
  age: number;
}

function computeMoonPhase(date: Date): MoonData {
  const JD = date.getTime() / 86400000 + 2440587.5;
  const knownNewMoon = 2451550.26; // Jan 6 2000 18:14 UTC
  const synodicPeriod = 29.53058867;

  const daysSince = JD - knownNewMoon;
  const age = ((daysSince % synodicPeriod) + synodicPeriod) % synodicPeriod;
  const fraction = age / synodicPeriod;
  const illumination = 0.5 * (1 - Math.cos(2 * Math.PI * fraction));

  let name: string;
  let emoji: string;
  if (fraction < 0.0625)      { name = "New Moon";        emoji = "🌑"; }
  else if (fraction < 0.1875) { name = "Waxing Crescent"; emoji = "🌒"; }
  else if (fraction < 0.3125) { name = "First Quarter";   emoji = "🌓"; }
  else if (fraction < 0.4375) { name = "Waxing Gibbous";  emoji = "🌔"; }
  else if (fraction < 0.5625) { name = "Full Moon";       emoji = "🌕"; }
  else if (fraction < 0.6875) { name = "Waning Gibbous";  emoji = "🌖"; }
  else if (fraction < 0.8125) { name = "Last Quarter";    emoji = "🌗"; }
  else if (fraction < 0.9375) { name = "Waning Crescent"; emoji = "🌘"; }
  else                         { name = "New Moon";        emoji = "🌑"; }

  const daysUntilFull = fraction < 0.5
    ? (0.5 - fraction) * synodicPeriod
    : (1.5 - fraction) * synodicPeriod;
  const daysUntilNew = (1 - fraction) * synodicPeriod;

  return { fraction, name, illumination, emoji, daysUntilFull, daysUntilNew, age };
}

function MoonSVG({ fraction, size = 96 }: { fraction: number; size?: number }) {
  const r = size / 2;
  const cx = r;
  const cy = r;
  const illumination = 0.5 * (1 - Math.cos(2 * Math.PI * fraction));

  // Phase: 0=new, 0.25=first quarter (right lit), 0.5=full, 0.75=last quarter (left lit)
  // We draw the lit portion using a combination of ellipse arcs
  const isWaxing = fraction < 0.5;
  const isNew = fraction < 0.04 || fraction > 0.96;
  const isFull = fraction > 0.46 && fraction < 0.54;

  // Calculate the x-scale of the terminator ellipse
  // At 0.25: terminator is at center (straight line)
  // At 0.5: full circle
  // Scale goes from -1 (new) through 0 (quarter) to +1 (full)
  const phaseAngle = fraction * 2 * Math.PI;
  const terminatorX = Math.cos(phaseAngle); // -1 to +1
  const limbScale = Math.abs(terminatorX);

  // Lit hemisphere paths
  let litPath: string;

  if (isNew) {
    litPath = "";
  } else if (isFull) {
    litPath = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
  } else if (fraction <= 0.5) {
    // Waxing: right side lit
    // Outer arc: right semicircle
    // Terminator: ellipse with x-scale depending on phase
    // Phase 0→0.25: terminator goes from full left curve to straight line
    // Phase 0.25→0.5: terminator goes from straight line to full right curve
    const tx = r * Math.cos(phaseAngle); // terminator ellipse half-width
    const sweep = fraction < 0.25 ? "0" : "1";
    litPath = [
      `M ${cx} ${cy - r}`,
      `A ${r} ${r} 0 0 1 ${cx} ${cy + r}`,    // right limb
      `A ${Math.abs(tx)} ${r} 0 0 ${sweep} ${cx} ${cy - r}`, // terminator
      `Z`,
    ].join(" ");
  } else {
    // Waning: left side lit
    const tx = r * Math.abs(Math.cos(phaseAngle));
    const sweep = fraction < 0.75 ? "1" : "0";
    litPath = [
      `M ${cx} ${cy - r}`,
      `A ${r} ${r} 0 0 0 ${cx} ${cy + r}`,    // left limb
      `A ${tx} ${r} 0 0 ${sweep} ${cx} ${cy - r}`, // terminator
      `Z`,
    ].join(" ");
  }

  const glow = illumination > 0.7 ? `drop-shadow(0 0 ${Math.round(illumination * 12)}px rgba(251,191,36,0.5))` : "none";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="moon-disc"
      style={{ filter: glow }}
    >
      {/* Dark side */}
      <circle cx={cx} cy={cy} r={r - 1} fill="#0d1829" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

      {/* Lit portion */}
      {litPath && (
        <clipPath id={`moon-clip-${size}`}>
          <circle cx={cx} cy={cy} r={r - 1} />
        </clipPath>
      )}
      {litPath && (
        <path
          d={litPath}
          fill="url(#moonGrad)"
          clipPath={`url(#moon-clip-${size})`}
        />
      )}

      <defs>
        <radialGradient id="moonGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="40%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>

      {/* Subtle craters on lit side */}
      {illumination > 0.3 && (
        <>
          <circle cx={cx + r * 0.2} cy={cy - r * 0.1} r={r * 0.06} fill="rgba(0,0,0,0.12)" clipPath={`url(#moon-clip-${size})`} />
          <circle cx={cx + r * 0.05} cy={cy + r * 0.3} r={r * 0.04} fill="rgba(0,0,0,0.1)" clipPath={`url(#moon-clip-${size})`} />
          <circle cx={cx + r * 0.35} cy={cy + r * 0.1} r={r * 0.05} fill="rgba(0,0,0,0.09)" clipPath={`url(#moon-clip-${size})`} />
        </>
      )}
    </svg>
  );
}

export default function MoonPhase({ compact = false }: { compact?: boolean }) {
  const moon = useMemo(() => computeMoonPhase(new Date()), []);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <MoonSVG fraction={moon.fraction} size={48} />
        <div>
          <div className="text-sm font-semibold text-amber-300">{moon.name}</div>
          <div className="text-xs text-slate-500 data-readout">{Math.round(moon.illumination * 100)}% illuminated</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center gap-4">
      <div className="flex items-center gap-2 self-start text-xs font-semibold text-amber-400 uppercase tracking-widest">
        <span className="w-1 h-1 rounded-full bg-amber-400 pulse-slow" />
        Moon Phase
      </div>

      <MoonSVG fraction={moon.fraction} size={96} />

      <div>
        <div className="text-lg font-bold text-amber-300">{moon.name}</div>
        <div className="text-2xl font-bold text-white data-readout mt-0.5">
          {Math.round(moon.illumination * 100)}%
          <span className="text-sm font-normal text-slate-500 ml-1">lit</span>
        </div>
      </div>

      <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${moon.illumination * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 w-full text-xs">
        <div className="glass-card rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-0.5">Full moon in</div>
          <div className="font-semibold text-amber-400 data-readout">
            {moon.daysUntilFull < 1 ? "Today" : `${Math.round(moon.daysUntilFull)}d`}
          </div>
        </div>
        <div className="glass-card rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-0.5">Moon age</div>
          <div className="font-semibold text-slate-300 data-readout">{moon.age.toFixed(1)}d</div>
        </div>
      </div>
    </div>
  );
}
