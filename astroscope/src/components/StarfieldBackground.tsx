"use client";

import { useEffect, useRef } from "react";

// Constellation definitions: stars as [x%, y%] viewport positions, lines as index pairs
const CONSTELLATIONS = [
  {
    name: "Orion",
    color: "rgba(147,197,253,",  // blue-ish
    stars: [
      [8, 18], [12, 22], [10, 28], // belt: Alnitak, Alnilam, Mintaka
      [6, 14],  // Betelgeuse
      [15, 14], // Bellatrix
      [7, 36],  // Saiph
      [14, 36], // Rigel
    ],
    lines: [[0,1],[1,2],[3,0],[1,4],[0,6],[2,5],[3,5],[4,6]],
  },
  {
    name: "Ursa Major",
    color: "rgba(196,181,253,", // violet
    stars: [
      [72, 12], [76, 10], [80, 11], [83, 14],
      [85, 18], [82, 20], [79, 22],
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,2]],
  },
  {
    name: "Cassiopeia",
    color: "rgba(167,243,208,", // emerald
    stars: [
      [46, 6], [50, 9], [54, 6], [58, 9], [62, 6],
    ],
    lines: [[0,1],[1,2],[2,3],[3,4]],
  },
  {
    name: "Scorpius",
    color: "rgba(252,165,165,", // red
    stars: [
      [78, 62], [81, 65], [83, 68], [85, 72],
      [83, 76], [80, 79], [77, 82],
      [76, 68], [74, 72],
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[2,7],[7,8]],
  },
  {
    name: "Cygnus",
    color: "rgba(253,224,132,", // amber
    stars: [
      [58, 28], [54, 32], [50, 36], [46, 40], // spine (top to bottom)
      [44, 32], [56, 32], // wings
    ],
    lines: [[0,1],[1,2],[2,3],[4,1],[1,5]],
  },
  {
    name: "Leo",
    color: "rgba(253,186,116,", // orange
    stars: [
      [28, 44], [25, 40], [22, 36], [24, 32],
      [29, 30], [32, 35], [35, 44],
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[5,6]],
  },
  {
    name: "Perseus",
    color: "rgba(147,197,253,",
    stars: [
      [34, 14], [37, 17], [40, 15], [38, 20], [35, 23],
    ],
    lines: [[0,1],[1,2],[1,3],[3,4]],
  },
  {
    name: "Lyra",
    color: "rgba(196,181,253,",
    stars: [
      [65, 30], [63, 34], [67, 34], [63, 38], [67, 38],
    ],
    lines: [[0,1],[0,2],[1,3],[2,4],[3,4],[1,2]],
  },
];

interface Star {
  x: number; y: number; r: number;
  opacity: number; twinkleSpeed: number; twinkleOffset: number;
  color: string;
}

interface ShootingStar {
  x: number; y: number; vx: number; vy: number;
  length: number; opacity: number; active: boolean;
}

function randBetween(a: number, b: number, seed: number) {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return a + (s - Math.floor(s)) * (b - a);
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const shootRef = useRef<ShootingStar>({ x:0, y:0, vx:0, vy:0, length:0, opacity:0, active:false });
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check reduced motion preference
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function buildStars(w: number, h: number) {
      const stars: Star[] = [];
      const colors = [
        "255,255,255", "200,220,255", "255,240,200",
        "220,200,255", "180,220,255",
      ];
      for (let i = 0; i < 420; i++) {
        const x = randBetween(0, w, i * 3.1);
        const y = randBetween(0, h, i * 7.3);
        const r = randBetween(0.3, 2.2, i * 11.7);
        const col = colors[Math.floor(randBetween(0, colors.length, i * 5.9))];
        stars.push({
          x, y, r,
          opacity: randBetween(0.4, 1, i * 9.1),
          twinkleSpeed: randBetween(0.5, 3, i * 13.3),
          twinkleOffset: randBetween(0, Math.PI * 2, i * 17.7),
          color: col,
        });
      }
      starsRef.current = stars;
    }

    function launchShootingStar(w: number) {
      const s = shootRef.current;
      s.x = randBetween(w * 0.1, w * 0.8, Date.now() % 1000);
      s.y = randBetween(10, 80, (Date.now() + 1) % 1000);
      const angle = randBetween(20, 50, (Date.now() + 2) % 1000) * Math.PI / 180;
      const speed = randBetween(8, 16, (Date.now() + 3) % 1000);
      s.vx = Math.cos(angle) * speed;
      s.vy = Math.sin(angle) * speed;
      s.length = randBetween(60, 160, (Date.now() + 4) % 1000);
      s.opacity = 1;
      s.active = true;
    }

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
      buildStars(canvas.width, canvas.height);
    }

    resize();
    window.addEventListener("resize", resize);

    // Schedule periodic shooting stars
    let shootInterval: ReturnType<typeof setInterval>;
    if (!prefersReduced) {
      shootInterval = setInterval(() => {
        if (!shootRef.current.active) launchShootingStar(canvas.width);
      }, 6000);
    }

    function drawConstellation(
      ctx: CanvasRenderingContext2D,
      con: typeof CONSTELLATIONS[0],
      w: number, h: number, t: number
    ) {
      const starPositions = con.stars.map(([xp, yp]) => ({
        x: (xp / 100) * w,
        y: (yp / 100) * h,
      }));

      // Draw lines
      ctx.save();
      const lineAlpha = 0.12 + Math.sin(t * 0.3) * 0.04;
      ctx.strokeStyle = `${con.color}${lineAlpha})`;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 6]);
      con.lines.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(starPositions[a].x, starPositions[a].y);
        ctx.lineTo(starPositions[b].x, starPositions[b].y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Draw constellation stars
      starPositions.forEach((pos, i) => {
        const pulse = 0.7 + Math.sin(t * 0.8 + i * 1.3) * 0.3;
        const r = i === 0 ? 2.5 : 1.8;

        // Glow
        const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 5);
        grd.addColorStop(0, `${con.color}${0.25 * pulse})`);
        grd.addColorStop(1, `${con.color}0)`);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Star dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `${con.color}${0.85 * pulse})`;
        ctx.fill();
      });

      ctx.restore();
    }

    function draw() {
      if (!canvas || !ctx) return;
      tRef.current += 0.016;
      const t = tRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background field stars
      starsRef.current.forEach((star) => {
        const twinkle = prefersReduced
          ? star.opacity
          : star.opacity * (0.6 + 0.4 * Math.sin(t * star.twinkleSpeed + star.twinkleOffset));

        // Subtle glow on bigger stars
        if (star.r > 1.5) {
          const g = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 3.5);
          g.addColorStop(0, `rgba(${star.color},${twinkle * 0.3})`);
          g.addColorStop(1, `rgba(${star.color},0)`);
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color},${twinkle})`;
        ctx.fill();
      });

      // Constellation overlays
      CONSTELLATIONS.forEach((con) => drawConstellation(ctx, con, w, h, t));

      // Shooting star
      if (!prefersReduced) {
        const s = shootRef.current;
        if (s.active) {
          s.x += s.vx;
          s.y += s.vy;
          s.opacity -= 0.025;
          if (s.opacity <= 0 || s.x > w + 100 || s.y > h + 100) {
            s.active = false;
          } else {
            ctx.save();
            const tailX = s.x - s.vx * (s.length / Math.hypot(s.vx, s.vy));
            const tailY = s.y - s.vy * (s.length / Math.hypot(s.vx, s.vy));
            const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
            grad.addColorStop(0, `rgba(255,255,255,0)`);
            grad.addColorStop(1, `rgba(255,255,255,${s.opacity})`);
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(s.x, s.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // Head sparkle
            ctx.beginPath();
            ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
            ctx.fill();
            ctx.restore();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      if (shootInterval) clearInterval(shootInterval);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    />
  );
}
