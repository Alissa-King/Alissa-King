"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AsteroidData {
  name: string;
  a: number;       // semi-major axis (AU)
  e: number;       // eccentricity
  i: number;       // inclination (deg)
  omega: number;   // longitude of ascending node (deg)
  w: number;       // argument of perihelion (deg)
  M0: number;      // mean anomaly at J2000 (deg)
  period: number;  // orbital period (days)
  closeApproach: string;
}

const ASTEROIDS: AsteroidData[] = [
  { name: "Apophis (99942)", a: 0.9224, e: 0.1913, i: 3.34, omega: 126.6, w: 126.4, M0: 203.0,
    period: 323.6, closeApproach: "2029-04-13" },
  { name: "Bennu (101955)",  a: 1.1264, e: 0.2037, i: 6.03, omega: 66.22, w: 101.7, M0: 101.8,
    period: 436.6, closeApproach: "2182-09-24" },
  { name: "Eros (433)",      a: 1.458,  e: 0.2227, i: 10.83,omega: 178.9, w: 178.9, M0: 180.0,
    period: 643.2, closeApproach: "2056-01-31" },
  { name: "Ryugu (162173)",  a: 1.1896, e: 0.1902, i: 5.88, omega: 211.4, w: 211.4, M0: 315.0,
    period: 474.1, closeApproach: "2076-06-06" },
  { name: "2024 YR4",        a: 1.054,  e: 0.2702, i: 3.41, omega: 28.5,  w: 28.5,  M0: 270.0,
    period: 395.3, closeApproach: "2032-12-22" },
];

// Solve Kepler's equation E - e*sin(E) = M via Newton-Raphson
function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 50; i++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

function orbitalToXY(a: number, e: number, trueAnomaly: number, scale: number) {
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(trueAnomaly));
  return { x: r * Math.cos(trueAnomaly) * scale, y: r * Math.sin(trueAnomaly) * scale };
}

const J2000 = new Date("2000-01-01T12:00:00Z").getTime();

export default function AsteroidOrbitViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const speedRef = useRef(1000);
  const pausedRef = useRef(false);
  const simTimeRef = useRef(Date.now());
  const lastRealRef = useRef(Date.now());

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [speed, setSpeed] = useState(1000);
  const [paused, setPaused] = useState(false);
  const [canvasSize, setCanvasSize] = useState(500);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => { speedRef.current = prefersReducedMotion ? 0 : speed; }, [speed, prefersReducedMotion]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const AU_SCALE = size * 0.18; // pixels per AU

    const now = Date.now();
    if (!pausedRef.current) {
      const dtReal = now - lastRealRef.current;
      simTimeRef.current += dtReal * speedRef.current;
    }
    lastRealRef.current = now;

    const daysSinceJ2000 = (simTimeRef.current - J2000) / (1000 * 60 * 60 * 24);

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#03070f";
    ctx.fillRect(0, 0, size, size);

    const asteroid = ASTEROIDS[selectedIdx];

    // Earth orbit
    const earthR = 1.0 * AU_SCALE;
    ctx.beginPath();
    ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(59,130,246,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Mars orbit
    const marsR = 1.524 * AU_SCALE;
    ctx.beginPath();
    ctx.arc(cx, cy, marsR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(239,68,68,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Asteroid orbit (Keplerian ellipse)
    // In 2D approximation projected onto ecliptic plane
    const { a, e } = asteroid;
    const b = a * Math.sqrt(1 - e * e); // semi-minor axis
    const c = a * e; // focus offset
    const aScaled = a * AU_SCALE;
    const bScaled = b * AU_SCALE;
    const cScaled = c * AU_SCALE;

    // Draw ellipse (Sun at focus)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.ellipse(-cScaled, 0, aScaled, bScaled, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(251,191,36,0.6)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.restore();

    // Perihelion label
    const perihX = cx + (a * (1 - e)) * AU_SCALE - cScaled;
    const perihY = cy;
    ctx.fillStyle = "rgba(251,191,36,0.7)";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("perihelion", perihX, perihY - 10);

    // Aphelion label
    const aphX = cx - (a * (1 + e)) * AU_SCALE - cScaled;
    const aphY = cy;
    ctx.fillText("aphelion", aphX, aphY - 10);

    // Sun glow + dot
    const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
    sunGlow.addColorStop(0, "rgba(255,220,50,0.9)");
    sunGlow.addColorStop(0.4, "rgba(255,160,20,0.4)");
    sunGlow.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.fillStyle = sunGlow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();

    // Earth position
    const earthN = 360 / 365.25; // deg/day
    const earthMeanLon = ((100.46 + earthN * daysSinceJ2000) % 360 + 360) % 360;
    const earthAngle = (earthMeanLon - 90) * (Math.PI / 180);
    const earthX = cx + earthR * Math.cos(earthAngle);
    const earthY = cy + earthR * Math.sin(earthAngle);

    ctx.beginPath();
    ctx.arc(earthX, earthY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();

    // Asteroid position
    const n = 360 / asteroid.period;
    const M = ((asteroid.M0 + n * daysSinceJ2000) % 360 + 360) % 360;
    const Mrad = M * (Math.PI / 180);
    const E = solveKepler(Mrad, asteroid.e);
    const trueAnom = 2 * Math.atan2(
      Math.sqrt(1 + asteroid.e) * Math.sin(E / 2),
      Math.sqrt(1 - asteroid.e) * Math.cos(E / 2)
    );
    const { x: astRelX, y: astRelY } = orbitalToXY(asteroid.a, asteroid.e, trueAnom, AU_SCALE);
    const astX = cx + astRelX - cScaled;
    const astY = cy + astRelY;

    // Close approach indicator: where asteroid orbit is closest to Earth orbit radius
    const closeApproachAngle = 0; // simplified: near perihelion for most NEAs
    const caAngle = closeApproachAngle * (Math.PI / 180);
    const caR = (a * (1 - e * e)) / (1 + e * Math.cos(caAngle));
    if (Math.abs(caR - 1.0) < 0.5) {
      const caX = cx + caR * AU_SCALE * Math.cos(caAngle - Math.PI / 2) - cScaled;
      const caY = cy + caR * AU_SCALE * Math.sin(caAngle - Math.PI / 2);
      ctx.beginPath();
      ctx.arc(caX, caY, 6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(239,68,68,0.7)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "rgba(239,68,68,0.6)";
      ctx.font = "9px monospace";
      ctx.textAlign = "left";
      ctx.fillText("close approach", caX + 8, caY + 4);
    }

    // Draw asteroid
    const astGlow = ctx.createRadialGradient(astX, astY, 0, astX, astY, 10);
    astGlow.addColorStop(0, "rgba(251,191,36,0.8)");
    astGlow.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(astX, astY, 10, 0, Math.PI * 2);
    ctx.fillStyle = astGlow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(astX, astY, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();

    // AU scale bar
    ctx.strokeStyle = "rgba(148,163,184,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, size - 20);
    ctx.lineTo(20 + AU_SCALE, size - 20);
    ctx.stroke();
    ctx.fillStyle = "rgba(148,163,184,0.5)";
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("1 AU", 20 + AU_SCALE / 2, size - 8);

    animRef.current = requestAnimationFrame(drawFrame);
  }, [selectedIdx]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      setCanvasSize(Math.min(container.clientWidth, 500));
    });
    ro.observe(container);
    setCanvasSize(Math.min(container.clientWidth, 500));
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
  }, [canvasSize]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFrame]);

  const asteroid = ASTEROIDS[selectedIdx];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
          className="bg-slate-800/60 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/60 transition-colors"
        >
          {ASTEROIDS.map((a, i) => (
            <option key={a.name} value={i}>{a.name}</option>
          ))}
        </select>
        <button
          onClick={() => setPaused((v) => !v)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            paused
              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
              : "bg-slate-800/60 text-slate-300 border-slate-700"
          }`}
        >
          {paused ? "▶" : "⏸"}
        </button>
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <span className="text-xs text-slate-500">Speed</span>
          <input
            type="range" min={1} max={100000} step={1} value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="flex-1 accent-amber-400"
          />
          <span className="text-xs text-amber-400 font-mono w-12">{speed}x</span>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full flex justify-center">
        <canvas
          ref={canvasRef}
          className="rounded-2xl border border-slate-800/60"
          style={{ width: canvasSize, height: canvasSize }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Semi-major axis", value: `${asteroid.a} AU` },
          { label: "Eccentricity",    value: asteroid.e.toFixed(4) },
          { label: "Inclination",     value: `${asteroid.i}°` },
          { label: "Next close appr.", value: asteroid.closeApproach },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-amber-400 font-mono text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-400/60 inline-block" /> Earth orbit</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-400/40 inline-block" /> Mars orbit</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-400/60 inline-block" /> Asteroid orbit</span>
      </div>
    </div>
  );
}
