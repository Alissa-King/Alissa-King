"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Bright star catalog: [name, RA (hours), Dec (degrees), magnitude, spectral (for color)]
const STARS: [string, number, number, number, string][] = [
  ["Sirius",       6.752, -16.716, -1.46, "A"],
  ["Canopus",      6.399, -52.695, -0.72, "F"],
  ["Arcturus",    14.261,  19.182, -0.04, "K"],
  ["Vega",        18.615,  38.784,  0.03, "A"],
  ["Capella",      5.278,  45.998,  0.08, "G"],
  ["Rigel",        5.242,  -8.202,  0.12, "B"],
  ["Procyon",      7.655,   5.225,  0.34, "F"],
  ["Betelgeuse",   5.920,   7.407,  0.58, "M"],
  ["Altair",      19.847,   8.868,  0.76, "A"],
  ["Aldebaran",    4.599,  16.509,  0.85, "K"],
  ["Antares",     16.490, -26.432,  0.96, "M"],
  ["Spica",       13.420, -11.161,  1.00, "B"],
  ["Pollux",       7.755,  28.026,  1.14, "K"],
  ["Fomalhaut",   22.961, -29.623,  1.16, "A"],
  ["Deneb",       20.691,  45.280,  1.25, "A"],
  ["Regulus",     10.140,  11.967,  1.35, "B"],
  ["Castor",       7.577,  31.889,  1.57, "A"],
  ["Bellatrix",    5.419,   6.350,  1.64, "B"],
  ["Alnath",       5.438,  28.608,  1.65, "B"],
  ["Alioth",      12.900,  55.960,  1.77, "A"],
  ["Mirfak",       3.408,  49.861,  1.79, "F"],
  ["Dubhe",       11.062,  61.751,  1.79, "K"],
  ["Alkaid",      13.792,  49.313,  1.86, "B"],
  ["Menkalinan",   5.992,  44.947,  1.90, "A"],
  ["Peacock",     20.428, -56.735,  1.94, "B"],
  ["Alphard",      9.460,  -8.659,  1.99, "K"],
  ["Polaris",      2.530,  89.264,  2.02, "F"],
  ["Hamal",        2.120,  23.463,  2.00, "K"],
  ["Denebola",    11.818,  14.572,  2.14, "A"],
  ["Schedar",      0.675,  56.537,  2.24, "K"],
  ["Alphecca",    15.578,  26.715,  2.23, "A"],
  ["Nunki",       18.921, -26.297,  2.05, "B"],
  ["Eltanin",     17.943,  51.489,  2.23, "K"],
  ["Kaus Australis",18.403,-34.384,  1.85, "B"],
  ["Mira",         2.319,  -2.978,  3.04, "M"],
  ["Albireo",     19.512,  27.959,  3.08, "K"],
  ["Rasalhague",  17.582,  12.560,  2.08, "A"],
  ["Sabik",       17.173, -15.725,  2.43, "A"],
  ["Shaula",      17.560, -37.104,  1.62, "B"],
  ["Lesath",      17.530, -37.296,  2.69, "B"],
  ["Izar",        14.749,  27.074,  2.35, "K"],
  ["Mizar",       13.399,  54.925,  2.04, "A"],
  ["Alcor",       13.421,  54.988,  3.99, "A"],
  ["Merak",       11.031,  56.382,  2.37, "A"],
  ["Phecda",      11.897,  53.695,  2.44, "A"],
  ["Megrez",      12.257,  57.032,  3.31, "A"],
  ["Phad",        11.897,  53.695,  2.44, "A"],
  ["Alderamin",   21.310,  62.585,  2.45, "A"],
  ["Alpheratz",    0.140,  29.090,  2.06, "B"],
  ["Mirach",       1.162,  35.621,  2.06, "M"],
];

// Constellation line pairs: [star1 name, star2 name]
const CONSTELLATION_LINES: [string, string][] = [
  // Orion
  ["Betelgeuse", "Bellatrix"],
  ["Betelgeuse", "Rigel"],
  ["Bellatrix",  "Rigel"],
  ["Betelgeuse", "Alnath"],
  // Ursa Major (Big Dipper)
  ["Dubhe",   "Merak"],
  ["Merak",   "Phecda"],
  ["Phecda",  "Megrez"],
  ["Megrez",  "Alioth"],
  ["Alioth",  "Mizar"],
  ["Mizar",   "Alkaid"],
  ["Dubhe",   "Alioth"],
  // Scorpius
  ["Antares", "Shaula"],
  ["Antares", "Sabik"],
  ["Shaula",  "Lesath"],
  // Cygnus (Northern Cross)
  ["Deneb",   "Albireo"],
  // Aquila
  ["Altair",  "Rasalhague"],
  // Perseus-Cassiopeia region
  ["Mirfak",  "Schedar"],
  // Bootes
  ["Arcturus","Izar"],
  // Leo
  ["Regulus", "Denebola"],
];

function spectralColor(type: string, mag: number): string {
  const a = Math.max(0.3, Math.min(1, 1 - (mag - (-1.5)) / 4.5));
  switch (type[0]) {
    case "O": return `rgba(155,176,255,${a})`;
    case "B": return `rgba(170,191,255,${a})`;
    case "A": return `rgba(240,245,255,${a})`;
    case "F": return `rgba(255,248,220,${a})`;
    case "G": return `rgba(255,237,156,${a})`;
    case "K": return `rgba(255,204,111,${a})`;
    case "M": return `rgba(255,153,102,${a})`;
    default:  return `rgba(220,220,255,${a})`;
  }
}

function julianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function gmstDeg(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const g = 280.46061837 + 360.98564736629 * (jd - 2451545) + T * T * 0.000387933;
  return ((g % 360) + 360) % 360;
}

function raDecToAltAz(ra_h: number, dec_deg: number, lat_deg: number, lst_deg: number) {
  const H = ((lst_deg - ra_h * 15) % 360 + 360) % 360;
  const Hr = H * (Math.PI / 180);
  const dr = dec_deg * (Math.PI / 180);
  const lr = lat_deg * (Math.PI / 180);

  const sinAlt = Math.sin(dr) * Math.sin(lr) + Math.cos(dr) * Math.cos(lr) * Math.cos(Hr);
  const alt_deg = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * (180 / Math.PI);

  const cosAz = (Math.sin(dr) - Math.sin(alt_deg * Math.PI / 180) * Math.sin(lr)) /
    (Math.cos(alt_deg * Math.PI / 180) * Math.cos(lr) + 1e-10);
  let az_deg = Math.acos(Math.max(-1, Math.min(1, cosAz))) * (180 / Math.PI);
  if (Math.sin(Hr) > 0) az_deg = 360 - az_deg;

  return { alt: alt_deg, az: az_deg };
}

function altAzToXY(alt: number, az: number, cx: number, cy: number, r: number) {
  const rho = r * (90 - alt) / 90;
  const theta = az * (Math.PI / 180);
  return {
    x: cx + rho * Math.sin(theta),
    y: cy - rho * Math.cos(theta),
  };
}

interface StarScreen {
  name: string;
  x: number;
  y: number;
  size: number;
  color: string;
  mag: number;
  alt: number;
  spectral: string;
}

type TooltipState = {
  x: number;
  y: number;
  star: StarScreen;
} | null;

export default function StarMap({ lat = 44.05, lon = -123.09 }: { lat?: number; lon?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; star: StarScreen } | null>(null);
  const [showConstellations, setShowConstellations] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const starsRef = useRef<StarScreen[]>([]);
  const animFrameRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 12;

    const now = currentTime;
    const jd = julianDate(now);
    const gmst = gmstDeg(jd);
    const lst = ((gmst + lon) % 360 + 360) % 360;

    ctx.clearRect(0, 0, size, size);

    // Background: deep sky dome
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    bg.addColorStop(0, "#0a1628");
    bg.addColorStop(0.5, "#070d1c");
    bg.addColorStop(1, "#030810");
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.restore();

    // Milky Way band (rough approximation along galactic equator)
    ctx.save();
    ctx.globalAlpha = 0.07;
    const mw = ctx.createLinearGradient(cx - r, cy + r * 0.2, cx + r, cy - r * 0.2);
    mw.addColorStop(0, "transparent");
    mw.addColorStop(0.3, "rgba(180,180,255,0.8)");
    mw.addColorStop(0.5, "rgba(200,200,255,1)");
    mw.addColorStop(0.7, "rgba(180,180,255,0.8)");
    mw.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = mw;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();

    // Compute star positions
    const computed: StarScreen[] = STARS.map(([name, ra, dec, mag, spec]) => {
      const { alt, az } = raDecToAltAz(ra, dec, lat, lst);
      const { x, y } = altAzToXY(alt, az, cx, cy, r);
      const size = Math.max(0.5, 3.5 - mag * 0.6);
      return { name, x, y, size, color: spectralColor(spec, mag), mag, alt, spectral: spec };
    });
    starsRef.current = computed;

    // Background field stars
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    for (let i = 0; i < 400; i++) {
      const seed = (i * 7919 + 13) % (r * 2);
      const sx = cx - r + (seed * 1.618) % (r * 2);
      const sy = cy - r + (seed * 2.718) % (r * 2);
      const sz = 0.3 + (i % 5) * 0.1;
      const op = 0.2 + (i % 7) * 0.05;
      ctx.beginPath();
      ctx.arc(sx, sy, sz, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,210,255,${op})`;
      ctx.fill();
    }
    ctx.restore();

    // Constellation lines
    if (showConstellations) {
      const starMap = new Map(computed.map((s) => [s.name, s]));
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      CONSTELLATION_LINES.forEach(([a, b]) => {
        const s1 = starMap.get(a);
        const s2 = starMap.get(b);
        if (!s1 || !s2 || s1.alt < 0 || s2.alt < 0) return;
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.strokeStyle = "rgba(56,189,248,0.18)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      });
      ctx.restore();
    }

    // Draw named stars
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    computed.forEach((star) => {
      if (star.alt < -5) return;
      const alpha = star.alt < 0 ? Math.max(0, 1 + star.alt / 5) : 1;
      ctx.globalAlpha = alpha;

      // Glow for bright stars
      if (star.mag < 1.5) {
        const g = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4);
        g.addColorStop(0, star.color.replace(/[\d.]+\)$/, "0.4)"));
        g.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // Star dot
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.fill();

      // Label for very bright stars
      if (star.mag < 0.5 && star.alt > 10) {
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = "rgba(180,220,255,0.8)";
        ctx.font = `${Math.max(9, size * 0.022)}px monospace`;
        ctx.fillText(star.name, star.x + star.size + 3, star.y - star.size - 1);
      }
    });
    ctx.globalAlpha = 1;
    ctx.restore();

    // Horizon ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(56,189,248,0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cardinal directions
    const dirs = [
      { label: "N", az: 0 },
      { label: "E", az: 90 },
      { label: "S", az: 180 },
      { label: "W", az: 270 },
    ];
    ctx.font = `bold ${Math.max(10, size * 0.028)}px sans-serif`;
    dirs.forEach(({ label, az }) => {
      const rad = az * (Math.PI / 180);
      const dx = Math.sin(rad) * (r + 8);
      const dy = -Math.cos(rad) * (r + 8);
      ctx.fillStyle = label === "N" ? "rgba(56,189,248,0.9)" : "rgba(148,163,184,0.7)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, cx + dx, cy + dy);
    });

    // Zenith marker
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(56,189,248,0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 30° / 60° altitude rings
    [30, 60].forEach((alt) => {
      const rr = r * (90 - alt) / 90;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.setLineDash([3, 6]);
      ctx.strokeStyle = "rgba(56,189,248,0.06)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.setLineDash([]);
    });

    ctx.restore();

    // Horizon glow
    const horizonGlow = ctx.createRadialGradient(cx, cy + r * 0.85, r * 0.1, cx, cy + r * 0.85, r * 0.5);
    horizonGlow.addColorStop(0, "rgba(8,145,178,0.12)");
    horizonGlow.addColorStop(1, "transparent");
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  }, [currentTime, showConstellations, lat, lon]);

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ro = new ResizeObserver(() => {
      const w = parent.clientWidth;
      const s = Math.min(w, 560);
      canvas.width = s;
      canvas.height = s;
      draw();
    });
    ro.observe(parent);
    const w = parent.clientWidth;
    const s = Math.min(w, 560);
    canvas.width = s;
    canvas.height = s;
    draw();
    return () => ro.disconnect();
  }, [draw]);

  // Animate (slow sidereal rotation)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // update every 30s
    return () => clearInterval(interval);
  }, []);

  // Redraw when dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse hover
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const hitStar = starsRef.current.find(
      (s) => s.alt > -5 && Math.hypot(s.x - mx, s.y - my) < Math.max(8, s.size * 3)
    );

    if (hitStar) {
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        star: hitStar,
      });
    } else {
      setTooltip(null);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500 font-mono">
          {currentTime.toUTCString().slice(0, 25)} UTC · {lat}°N {Math.abs(lon)}°W
        </div>
        <button
          onClick={() => setShowConstellations((v) => !v)}
          className={`text-xs px-3 py-1 rounded-lg border transition-all ${
            showConstellations
              ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
              : "text-slate-500 border-slate-700 hover:border-slate-500"
          }`}
        >
          Constellations
        </button>
      </div>

      <div className="relative w-full flex justify-center">
        <div className="relative" style={{ maxWidth: 560 }}>
          <canvas
            ref={canvasRef}
            className="rounded-full cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTooltip(null)}
          />
          {tooltip && (
            <div
              className="info-tooltip absolute z-20 pointer-events-none"
              style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
            >
              <div className="font-semibold text-white">{tooltip.star.name}</div>
              <div className="text-slate-400">
                Mag {tooltip.star.mag.toFixed(2)} · Type {tooltip.star.spectral}
              </div>
              <div className="text-sky-400">
                Alt {tooltip.star.alt.toFixed(1)}°
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white/90 inline-block" /> A/F-type</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-300 inline-block" /> G/K-type</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> M-type</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-300 inline-block" /> B-type</span>
        <span className="flex items-center gap-1.5 opacity-50">--- constellations</span>
      </div>
    </div>
  );
}
