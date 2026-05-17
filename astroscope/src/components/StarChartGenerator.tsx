"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Star catalog (same as StarMap) ──────────────────────────────────────────
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
  ["Kaus Australis",18.403,-34.384, 1.85, "B"],
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
  ["Alderamin",   21.310,  62.585,  2.45, "A"],
  ["Alpheratz",    0.140,  29.090,  2.06, "B"],
  ["Mirach",       1.162,  35.621,  2.06, "M"],
];

const CONSTELLATION_LINES: [string, string][] = [
  ["Betelgeuse", "Bellatrix"], ["Betelgeuse", "Rigel"], ["Bellatrix",  "Rigel"], ["Betelgeuse", "Alnath"],
  ["Dubhe",   "Merak"],  ["Merak",   "Phecda"], ["Phecda",  "Megrez"],
  ["Megrez",  "Alioth"], ["Alioth",  "Mizar"],  ["Mizar",   "Alkaid"], ["Dubhe", "Alioth"],
  ["Antares", "Shaula"], ["Antares", "Sabik"],  ["Shaula",  "Lesath"],
  ["Deneb",   "Albireo"],["Altair",  "Rasalhague"],
  ["Mirfak",  "Schedar"],["Arcturus","Izar"],   ["Regulus", "Denebola"],
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
  return { x: cx + rho * Math.sin(theta), y: cy - rho * Math.cos(theta) };
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function StarChartGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [lat, setLat] = useState(40);
  const [lon, setLon] = useState(-74);
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("22:00");
  const [generated, setGenerated] = useState(false);
  const [lst, setLst] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState(500);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      setCanvasSize(Math.min(container.clientWidth, 560));
    });
    ro.observe(container);
    setCanvasSize(Math.min(container.clientWidth, 560));
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    if (generated) drawChart(canvasSize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize]);

  const drawChart = useCallback((size: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 18;

    // Parse date+time
    const dt = new Date(`${date}T${time}:00`);
    const jd = julianDate(dt);
    const gmst = gmstDeg(jd);
    const lstDeg = ((gmst + lon) % 360 + 360) % 360;
    setLst(lstDeg);

    ctx.clearRect(0, 0, size, size);

    // Sky background
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    bg.addColorStop(0, "#0a1628");
    bg.addColorStop(0.5, "#070d1c");
    bg.addColorStop(1, "#030810");
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill();
    ctx.restore();

    // Milky Way
    ctx.save(); ctx.globalAlpha = 0.07;
    const mw = ctx.createLinearGradient(cx - r, cy + r * 0.2, cx + r, cy - r * 0.2);
    mw.addColorStop(0, "transparent");
    mw.addColorStop(0.3, "rgba(180,180,255,0.8)");
    mw.addColorStop(0.5, "rgba(200,200,255,1)");
    mw.addColorStop(0.7, "rgba(180,180,255,0.8)");
    mw.addColorStop(1, "transparent");
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = mw; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();

    // Background field stars
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    for (let i = 0; i < 400; i++) {
      const seed = (i * 7919 + 13) % (r * 2);
      const sx = cx - r + (seed * 1.618) % (r * 2);
      const sy = cy - r + (seed * 2.718) % (r * 2);
      ctx.beginPath(); ctx.arc(sx, sy, 0.3 + (i % 5) * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,210,255,${0.2 + (i % 7) * 0.05})`; ctx.fill();
    }
    ctx.restore();

    // Compute star positions
    const computed = STARS.map(([name, ra, dec, mag, spec]) => {
      const { alt, az } = raDecToAltAz(ra, dec, lat, lstDeg);
      const { x, y } = altAzToXY(alt, az, cx, cy, r);
      const starSize = Math.max(0.5, 3.5 - mag * 0.6);
      return { name, x, y, size: starSize, color: spectralColor(spec, mag), mag, alt, spectral: spec };
    });

    // Constellation lines
    const starMap = new Map(computed.map((s) => [s.name, s]));
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    CONSTELLATION_LINES.forEach(([a, b]) => {
      const s1 = starMap.get(a); const s2 = starMap.get(b);
      if (!s1 || !s2 || s1.alt < 0 || s2.alt < 0) return;
      ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y);
      ctx.strokeStyle = "rgba(56,189,248,0.18)"; ctx.lineWidth = 0.7; ctx.stroke();
    });
    ctx.restore();

    // Draw stars
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    computed.forEach((star) => {
      if (star.alt < -5) return;
      const alpha = star.alt < 0 ? Math.max(0, 1 + star.alt / 5) : 1;
      ctx.globalAlpha = alpha;
      if (star.mag < 1.5) {
        const g = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4);
        g.addColorStop(0, star.color.replace(/[\d.]+\)$/, "0.4)"));
        g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = star.color; ctx.fill();
      if (star.mag < 0.5 && star.alt > 10) {
        ctx.globalAlpha = alpha * 0.7; ctx.fillStyle = "rgba(180,220,255,0.8)";
        ctx.font = `${Math.max(9, size * 0.022)}px monospace`;
        ctx.fillText(star.name, star.x + star.size + 3, star.y - star.size - 1);
      }
    });
    ctx.globalAlpha = 1; ctx.restore();

    // Horizon ring + cardinal directions
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(56,189,248,0.25)"; ctx.lineWidth = 1.5; ctx.stroke();
    [{ label: "N", az: 0 }, { label: "E", az: 90 }, { label: "S", az: 180 }, { label: "W", az: 270 }].forEach(({ label, az }) => {
      const rad = az * (Math.PI / 180);
      ctx.fillStyle = label === "N" ? "rgba(56,189,248,0.9)" : "rgba(148,163,184,0.7)";
      ctx.font = `bold ${Math.max(10, size * 0.028)}px sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(label, cx + Math.sin(rad) * (r + 8), cy - Math.cos(rad) * (r + 8));
    });
    [30, 60].forEach((alt) => {
      const rr = r * (90 - alt) / 90;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.setLineDash([3, 6]); ctx.strokeStyle = "rgba(56,189,248,0.06)";
      ctx.lineWidth = 0.8; ctx.stroke(); ctx.setLineDash([]);
    });
    ctx.restore();

    // Title block (for print)
    ctx.fillStyle = "rgba(56,189,248,0.6)";
    ctx.font = `bold ${Math.max(9, size * 0.02)}px monospace`;
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(`${lat}°, ${lon}° · ${date} ${time}`, 10, size - 18);
  }, [lat, lon, date, time]);

  const generate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvas.width !== canvasSize) { canvas.width = canvasSize; canvas.height = canvasSize; }
    setGenerated(true);
    drawChart(canvasSize);
  };

  const handlePrint = () => window.print();

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #star-chart-print-root { display: block !important; }
          #star-chart-print-root * { display: revert !important; }
          nav, header, footer { display: none !important; }
          .no-print { display: none !important; }
          #star-chart-canvas { display: block !important; width: 100% !important; }
        }
      `}</style>

      <div id="star-chart-print-root" className="space-y-6">
        {/* Controls */}
        <div className="no-print glass-card rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Latitude</label>
              <input
                type="number" min={-90} max={90} value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="bg-slate-800/60 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500/60 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Longitude</label>
              <input
                type="number" min={-180} max={180} value={lon}
                onChange={(e) => setLon(Number(e.target.value))}
                className="bg-slate-800/60 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500/60 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Date</label>
              <input
                type="date" value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-slate-800/60 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500/60 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Time (local)</label>
              <input
                type="time" value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-slate-800/60 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500/60 transition-colors"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={generate}
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors"
            >
              Generate Chart
            </button>
            {generated && (
              <button
                onClick={handlePrint}
                className="px-5 py-2 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-sm font-medium transition-colors"
              >
                🖨 Print / Save as PDF
              </button>
            )}
            {lst !== null && (
              <span className="ml-auto text-xs text-slate-500 font-mono">
                LST: {Math.floor(lst / 15)}h {Math.floor((lst % 15) * 4)}m
              </span>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="w-full flex justify-center">
          {!generated ? (
            <div className="w-full max-w-[560px] aspect-square rounded-full border border-slate-800/60 bg-slate-950/60 flex items-center justify-center">
              <p className="text-slate-600 text-sm">Configure parameters above and click Generate Chart</p>
            </div>
          ) : (
            <canvas
              id="star-chart-canvas"
              ref={canvasRef}
              className="rounded-full"
              style={{ width: canvasSize, height: canvasSize }}
            />
          )}
        </div>

        {/* Legend */}
        {generated && (
          <div className="no-print glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Legend</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-slate-500 mb-2">Star Size = Magnitude</p>
                <div className="flex items-end gap-4">
                  {[[-1.5, 5.5], [0, 4], [1, 3.4], [2, 2.8], [3, 2.2]].map(([mag, sz]) => (
                    <div key={mag} className="flex flex-col items-center gap-1">
                      <div className="rounded-full bg-white" style={{ width: sz * 2, height: sz * 2 }} />
                      <span className="text-[9px] text-slate-600 font-mono">{mag >= 0 ? `+${mag}` : mag}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Star Color = Spectral Type</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "B-type", color: "bg-blue-300" },
                    { label: "A/F-type", color: "bg-white/90" },
                    { label: "G-type", color: "bg-yellow-200" },
                    { label: "K-type", color: "bg-amber-300" },
                    { label: "M-type", color: "bg-red-400" },
                  ].map(({ label, color }) => (
                    <span key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className={`w-2.5 h-2.5 rounded-full ${color} inline-block`} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
