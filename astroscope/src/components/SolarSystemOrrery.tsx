"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Planet {
  name: string;
  a: number;       // semi-major axis (AU)
  period: number;  // orbital period (days)
  color: string;
  radius: number;  // display radius (px)
  hasRing?: boolean;
}

const PLANETS: Planet[] = [
  { name: "Mercury", a: 0.387, period: 87.97,   color: "#94a3b8", radius: 3   },
  { name: "Venus",   a: 0.723, period: 224.7,   color: "#fde68a", radius: 5   },
  { name: "Earth",   a: 1.000, period: 365.25,  color: "#3b82f6", radius: 5.5 },
  { name: "Mars",    a: 1.524, period: 686.97,  color: "#ef4444", radius: 4   },
  { name: "Jupiter", a: 5.203, period: 4332.59, color: "#fed7aa", radius: 10  },
  { name: "Saturn",  a: 9.537, period: 10759.2, color: "#fef9c3", radius: 8.5, hasRing: true },
  { name: "Uranus",  a: 19.19, period: 30688.5, color: "#a5f3fc", radius: 7   },
  { name: "Neptune", a: 30.07, period: 60182.0, color: "#818cf8", radius: 7   },
];

// J2000.0 mean longitudes (degrees) for approximate starting positions
const MEAN_LONGITUDE_J2000: Record<string, number> = {
  Mercury: 252.25,
  Venus:   181.98,
  Earth:   100.46,
  Mars:    355.45,
  Jupiter: 34.40,
  Saturn:  49.94,
  Uranus:  313.23,
  Neptune: 304.88,
};

// J2000 epoch
const J2000 = new Date("2000-01-01T12:00:00Z").getTime();

interface TooltipInfo {
  name: string;
  distanceAU: number;
  period: number;
  x: number;
  y: number;
}

export default function SolarSystemOrrery() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const speedRef = useRef(1000);
  const pausedRef = useRef(false);
  const simTimeRef = useRef(Date.now());
  const lastRealRef = useRef(Date.now());
  const planetPositionsRef = useRef<{ x: number; y: number; planet: Planet }[]>([]);
  const simDateRef = useRef<Date>(new Date());

  const [speed, setSpeed] = useState(1000);
  const [paused, setPaused] = useState(false);
  const [simDate, setSimDate] = useState(new Date());
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [canvasSize, setCanvasSize] = useState(500);

  // Keep refs in sync
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const getOrbitRadius = useCallback((a: number, maxAU: number, maxR: number) => {
    return (Math.log(a + 1) / Math.log(maxAU + 1)) * maxR;
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 20;
    const maxAU = 30.07;

    // Advance simulated time
    const now = Date.now();
    if (!pausedRef.current) {
      const dtReal = now - lastRealRef.current;
      simTimeRef.current += dtReal * speedRef.current;
    }
    lastRealRef.current = now;

    const currentSimDate = new Date(simTimeRef.current);
    const daysSinceJ2000 = (simTimeRef.current - J2000) / (1000 * 60 * 60 * 24);

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = "#03070f";
    ctx.fillRect(0, 0, size, size);

    // Sun glow
    const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
    sunGlow.addColorStop(0, "rgba(255,220,50,0.9)");
    sunGlow.addColorStop(0.3, "rgba(255,180,20,0.5)");
    sunGlow.addColorStop(0.6, "rgba(255,140,0,0.15)");
    sunGlow.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fillStyle = sunGlow;
    ctx.fill();

    // Sun
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();

    // Asteroid belt (between Mars a=1.524 and Jupiter a=5.203)
    const marsR = getOrbitRadius(1.524, maxAU, maxR);
    const jupR = getOrbitRadius(5.203, maxAU, maxR);
    const beltR = (marsR + jupR) / 2;
    const beltWidth = (jupR - marsR) * 0.6;
    ctx.save();
    ctx.setLineDash([1, 4]);
    ctx.strokeStyle = "rgba(148,163,184,0.15)";
    ctx.lineWidth = beltWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, beltR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Draw orbit circles
    PLANETS.forEach((planet) => {
      const r = getOrbitRadius(planet.a, maxAU, maxR);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(148,163,184,0.08)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    // Draw planets
    const positions: { x: number; y: number; planet: Planet }[] = [];

    PLANETS.forEach((planet) => {
      const r = getOrbitRadius(planet.a, maxAU, maxR);
      const meanLon0 = MEAN_LONGITUDE_J2000[planet.name] ?? 0;
      const n = 360 / planet.period; // deg/day
      const meanLon = ((meanLon0 + n * daysSinceJ2000) % 360 + 360) % 360;
      const angleRad = (meanLon - 90) * (Math.PI / 180); // -90 so 0° starts at top

      const px = cx + r * Math.cos(angleRad);
      const py = cy + r * Math.sin(angleRad);

      positions.push({ x: px, y: py, planet });

      // Saturn ring
      if (planet.hasRing) {
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(1, 0.35);
        ctx.beginPath();
        ctx.arc(0, 0, planet.radius * 2.2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(254,249,195,0.4)";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // Planet glow for gas giants
      if (planet.radius >= 7) {
        const glow = ctx.createRadialGradient(px, py, 0, px, py, planet.radius * 2.5);
        glow.addColorStop(0, planet.color + "60");
        glow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(px, py, planet.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      // Planet
      ctx.beginPath();
      ctx.arc(px, py, planet.radius, 0, Math.PI * 2);
      ctx.fillStyle = planet.color;
      ctx.fill();
    });

    planetPositionsRef.current = positions;
    simDateRef.current = currentSimDate;

    animRef.current = requestAnimationFrame(drawFrame);
  }, [getOrbitRadius]);

  // Date display update
  useEffect(() => {
    const interval = setInterval(() => {
      setSimDate(new Date(simDateRef.current));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Setup canvas size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      const w = Math.min(container.clientWidth, 600);
      setCanvasSize(w);
    });
    ro.observe(container);
    setCanvasSize(Math.min(container.clientWidth, 600));
    return () => ro.disconnect();
  }, []);

  // Update canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
  }, [canvasSize]);

  // Start animation
  useEffect(() => {
    animRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFrame]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const hit = planetPositionsRef.current.find(
      ({ x, y, planet }) => Math.hypot(x - mx, y - my) < planet.radius + 8
    );

    if (hit) {
      setTooltip({
        name: hit.planet.name,
        distanceAU: hit.planet.a,
        period: hit.planet.period,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    } else {
      setTooltip(null);
    }
  }, []);

  const togglePause = () => {
    if (!pausedRef.current) {
      lastRealRef.current = Date.now();
    }
    setPaused((v) => !v);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={togglePause}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            paused
              ? "bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25"
              : "bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-700/60"
          }`}
        >
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0 max-w-xs">
          <span className="text-xs text-slate-500 shrink-0">Speed</span>
          <input
            type="range"
            min={1}
            max={100000}
            step={1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="flex-1 accent-sky-400"
          />
          <span className="text-xs text-slate-400 font-mono w-16 shrink-0">
            {speed >= 86400 ? `${(speed / 86400).toFixed(1)}d/s` : speed >= 3600 ? `${(speed / 3600).toFixed(1)}h/s` : `${speed}x`}
          </span>
        </div>

        <div className="text-xs text-slate-400 font-mono ml-auto">
          {simDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative w-full flex justify-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="rounded-2xl border border-slate-800/60 cursor-crosshair"
            style={{ width: canvasSize, height: canvasSize }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTooltip(null)}
          />
          {tooltip && (
            <div
              className="absolute z-20 pointer-events-none info-tooltip"
              style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
            >
              <div className="font-semibold text-white">{tooltip.name}</div>
              <div className="text-slate-400 text-xs">
                {tooltip.distanceAU.toFixed(3)} AU from Sun
              </div>
              <div className="text-sky-400 text-xs">
                Period: {tooltip.period >= 365 ? `${(tooltip.period / 365.25).toFixed(2)} yr` : `${tooltip.period.toFixed(1)} d`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
