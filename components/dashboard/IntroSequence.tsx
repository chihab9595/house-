"use client";

// Séquence d'ouverture du thème Jarvis — animation Canvas 2D jouée à
// l'arrivée sur l'accueil (~8,6 s) : étincelle → viseur holographique →
// traversée → révélation du nom, puis une orbe de lumière quitte l'écran
// d'intro pour "allumer" le cœur pulsant et l'ECG du tableau de bord.
// Purement décoratif — ne lit ni n'écrit aucune donnée de l'app. Fournie
// par l'utilisateur (maquette HTML statique) et portée ici telle quelle.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CFG = {
  hue: 188, // cyan HOUSE (#4de8ff)
  logo: "HOUSE",
  speed: 1.25, // 1 = vitesse d'origine, plus haut = intro plus courte
  handoff: 8.3, // instant où la lumière quitte l'intro pour rejoindre le tableau de bord
};

// true = l'intro ne rejoue pas à chaque retour sur l'accueil, seulement au
// premier lancement de l'app (sessionStorage : remise à zéro à chaque
// redémarrage de l'app/fenêtre, pas à chaque navigation interne).
const PLAY_ONCE_PER_SESSION = true;

const TAU = Math.PI * 2;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const smooth = (t: number, a: number, b: number) => {
  const x = seg(t, a, b);
  return x * x * (3 - 2 * x);
};
const inCube = (x: number) => x * x * x;
const outCube = (x: number) => 1 - Math.pow(1 - x, 3);

interface Point {
  x: number;
  y: number;
  z0: number;
  v: number;
  big: boolean;
}

const PTS: Point[] = (() => {
  const pts: Point[] = [];
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < 150; i++) {
    pts.push({
      x: (rnd() * 2 - 1) * 1.5,
      y: (rnd() * 2 - 1) * 1.5,
      z0: 0.16 + rnd() * 1.35,
      v: 0.15 + rnd() * 0.13,
      big: rnd() > 0.9,
    });
  }
  return pts;
})();

const RINGS = [
  { rr: 0.42, kind: "core", spin: -14, d: 0.0 },
  { rr: 0.5, kind: "thin", spin: 7, d: 0.1 },
  { rr: 0.57, kind: "blocks", spin: 20, d: 0.05 },
  { rr: 0.64, kind: "ticks", spin: -10, d: 0.17 },
  { rr: 0.72, kind: "arcs", spin: 12, d: 0.24 },
  { rr: 0.8, kind: "dots", spin: -8, d: 0.31 },
  { rr: 0.88, kind: "thin2", spin: 6, d: 0.38 },
  { rr: 0.99, kind: "outer", spin: -5, d: 0.46 },
];

export default function IntroSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(true);
  // La superposition d'intro doit être un enfant direct de <body>, pas de
  // .shell : .shell passe à opacity:0 pendant le chargement (booting), donc
  // tout ce qui est imbriqué dedans — canvas compris — serait dessiné mais
  // invisible. On la sort via un portail, monté seulement après hydratation
  // (document n'existe pas côté serveur).
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const core = document.querySelector<HTMLElement>(".pulse-wrap .core");
    const rings = [...document.querySelectorAll<HTMLElement>(".pulse-wrap .ring")].reverse();
    const ekg = document.querySelector<SVGPolylineElement>(".ekg-line");

    function wake() {
      document.body.classList.remove("booting");
      core?.classList.add("on");
      rings.forEach((el) => el.classList.add("on"));
      ekg?.classList.add("on");
    }

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = PLAY_ONCE_PER_SESSION && sessionStorage.getItem("house-intro") === "1";

    if (reduced || seen) {
      wake();
      setVisible(false);
      return;
    }

    const canvas = canvasRef.current;
    const layer = layerRef.current;
    const orb = orbRef.current;
    const skipBtn = skipRef.current;
    if (!canvas || !layer || !orb || !skipBtn) return;

    document.body.classList.add("booting");
    sessionStorage.setItem("house-intro", "1");

    const ctx = canvas.getContext("2d")!;
    let W = 0;
    let H = 0;
    let DPR = 1;
    let running = true;
    let handed = false;
    let t0 = performance.now();
    let rafId = 0;

    function resize() {
      const r = canvas!.parentElement!.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas!.width = Math.round(W * DPR);
      canvas!.height = Math.round(H * DPR);
    }
    window.addEventListener("resize", resize);

    const col = (a: number, l = 62, s = 100) => `hsla(${CFG.hue},${s}%,${l}%,${a})`;

    function background(t: number) {
      ctx.fillStyle = "#000307";
      ctx.fillRect(0, 0, W, H);
      const R = Math.max(W, H) * 0.78;
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, R);
      const lift = 0.8 + 0.2 * Math.sin(t * 0.9);
      g.addColorStop(0, col(0.34 * lift, 27));
      g.addColorStop(0.45, col(0.17 * lift, 20));
      g.addColorStop(1, "hsla(0,0%,0%,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function flare(a: number, size: number) {
      if (a <= 0.004) return;
      const cx = W / 2;
      const cy = H / 2;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      const rr = Math.min(W, H) * size;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
      g.addColorStop(0, `hsla(0,0%,100%,${0.95 * a})`);
      g.addColorStop(0.16, col(0.8 * a, 76));
      g.addColorStop(0.45, col(0.22 * a, 56));
      g.addColorStop(1, col(0, 50));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, TAU);
      ctx.fill();

      const lw = W * 1.05 * a;
      const lh = Math.max(1.5, H * 0.01 * a);
      const lg = ctx.createLinearGradient(cx - lw / 2, 0, cx + lw / 2, 0);
      lg.addColorStop(0, col(0, 60));
      lg.addColorStop(0.5, col(0.6 * a, 78));
      lg.addColorStop(1, col(0, 60));
      ctx.fillStyle = lg;
      ctx.fillRect(cx - lw / 2, cy - lh / 2, lw, lh);

      const vh = H * 0.5 * a;
      const vw = Math.max(1, W * 0.004 * a);
      const vg = ctx.createLinearGradient(0, cy - vh / 2, 0, cy + vh / 2);
      vg.addColorStop(0, col(0, 60));
      vg.addColorStop(0.5, col(0.3 * a, 74));
      vg.addColorStop(1, col(0, 60));
      ctx.fillStyle = vg;
      ctx.fillRect(cx - vw / 2, cy - vh / 2, vw, vh);

      ctx.restore();
    }

    function shockwave(t: number) {
      const u = seg(t, 0.55, 1.9);
      if (u <= 0 || u >= 1) return;
      const a = (1 - u) * 0.28;
      const r = Math.min(W, H) * (0.05 + 0.75 * outCube(u));
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = col(a, 68);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, r, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    function ring(r: number, lw: number, a: number, l = 58) {
      ctx.strokeStyle = col(a, l);
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.stroke();
    }
    function arcs(r: number, lw: number, a: number, list: [number, number][], l = 62, glow = 0) {
      ctx.strokeStyle = col(a, l);
      ctx.lineWidth = lw;
      ctx.lineCap = "butt";
      if (glow) {
        ctx.shadowBlur = glow;
        ctx.shadowColor = col(a * 0.9, 66);
      }
      for (const [s, e] of list) {
        ctx.beginPath();
        ctx.arc(0, 0, r, s * TAU, e * TAU);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }
    function ticks(r: number, n: number, len: number, lw: number, a: number, every = 6, l = 60) {
      ctx.lineWidth = lw;
      for (let i = 0; i < n; i++) {
        const big = i % every === 0;
        const A = (i / n) * TAU;
        const L = big ? len * 2 : len;
        ctx.strokeStyle = col(a * (big ? 1 : 0.5), l);
        ctx.beginPath();
        ctx.moveTo(Math.cos(A) * r, Math.sin(A) * r);
        ctx.lineTo(Math.cos(A) * (r + L), Math.sin(A) * (r + L));
        ctx.stroke();
      }
    }
    function blocks(r: number, n: number, w: number, h: number, a: number, list: [number, number][], l = 66) {
      for (let i = 0; i < n; i++) {
        const f = i / n;
        let on = false;
        for (const [s, e] of list) if (f >= s && f <= e) on = true;
        if (!on) continue;
        const A = f * TAU;
        ctx.save();
        ctx.rotate(A);
        ctx.translate(r, 0);
        ctx.fillStyle = col(a * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7))), l);
        ctx.fillRect(-h / 2, -w / 2, h, w);
        ctx.restore();
      }
    }
    function dots(r: number, n: number, s: number, a: number, l = 60) {
      ctx.fillStyle = col(a, l);
      for (let i = 0; i < n; i++) {
        const A = (i / n) * TAU;
        ctx.beginPath();
        ctx.arc(Math.cos(A) * r, Math.sin(A) * r, s, 0, TAU);
        ctx.fill();
      }
    }

    function hud(t: number) {
      const birth = seg(t, 1.1, 2.35);
      if (birth <= 0) return;

      const zu = seg(t, 4.1, 5.55);
      const zoom = 1 + 20 * Math.pow(zu, 2.2);
      const fade = 1 - smooth(t, 5.0, 5.6);
      if (fade <= 0.003) return;

      const R = Math.min(W, H) * 0.4 * zoom;

      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.globalCompositeOperation = "lighter";

      const hg = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.48);
      hg.addColorStop(0, col(0.3 * birth * fade, 52));
      hg.addColorStop(0.7, col(0.1 * birth * fade, 44));
      hg.addColorStop(1, col(0, 40));
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.48, 0, TAU);
      ctx.fill();

      for (const rg of RINGS) {
        const ap = outCube(clamp((birth - rg.d) / (1 - rg.d)));
        if (ap <= 0) continue;
        const a = ap * fade;
        const r = R * rg.rr * (0.62 + 0.38 * ap);
        const rot = (t * rg.spin * Math.PI) / 180 + (1 - ap) * rg.spin * 0.05;

        ctx.save();
        ctx.rotate(rot);

        switch (rg.kind) {
          case "core": {
            const pulse = 0.82 + 0.18 * Math.sin(t * 3.1);
            arcs(
              r,
              3.0,
              a * pulse,
              [
                [0.02, 0.23],
                [0.27, 0.48],
                [0.52, 0.73],
                [0.77, 0.98],
              ],
              74,
              22
            );
            ring(r * 0.94, 1, a * 0.45, 60);
            ticks(r * 1.04, 44, R * 0.016, 1, a * 0.5, 4, 64);
            break;
          }
          case "thin":
            ring(r, 1, a * 0.55, 54);
            arcs(r, 2.2, a * 0.95, [[0.3, 0.42]], 72, 10);
            dots(r * 1.05, 90, Math.max(0.7, R * 0.005), a * 0.5, 60);
            break;
          case "blocks":
            blocks(
              r,
              56,
              R * 0.048,
              R * 0.024,
              a * 1.05,
              [
                [0.04, 0.32],
                [0.53, 0.8],
              ],
              72
            );
            ring(r * 1.06, 1, a * 0.3, 52);
            break;
          case "ticks":
            ticks(r, 72, R * 0.026, 1.1, a * 1.0, 6, 66);
            break;
          case "arcs":
            arcs(
              r,
              3.6,
              a * 1.0,
              [
                [0.03, 0.2],
                [0.3, 0.45],
                [0.55, 0.7],
                [0.8, 0.95],
              ],
              66,
              16
            );
            break;
          case "dots":
            dots(r, 96, Math.max(0.9, R * 0.007), a * 0.8, 62);
            break;
          case "thin2":
            ring(r, 1, a * 0.42, 52);
            arcs(
              r,
              2.8,
              a * 0.9,
              [
                [0.12, 0.18],
                [0.46, 0.52],
                [0.79, 0.85],
              ],
              70,
              10
            );
            ticks(r * 1.03, 120, R * 0.012, 1, a * 0.35, 10, 58);
            break;
          case "outer":
            arcs(
              r,
              1.6,
              a * 0.55,
              [
                [0.05, 0.28],
                [0.38, 0.62],
                [0.72, 0.95],
              ],
              56
            );
            break;
        }
        ctx.restore();
      }
      ctx.restore();
    }

    function hexMesh(t: number) {
      const a = Math.sin(Math.PI * seg(t, 4.8, 5.85)) * 0.45;
      if (a <= 0.01) return;
      const sc = 1 + 2.4 * inCube(seg(t, 4.8, 5.85));
      const s = 22 * sc;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const cols = Math.ceil(W / s) + 2;
      const rows = Math.ceil(H / (s * 0.866)) + 2;
      for (let j = -1; j < rows; j++) {
        for (let i = -1; i < cols; i++) {
          const x = i * s + (j % 2 ? s / 2 : 0);
          const y = j * s * 0.866;
          const dx = (x - W / 2) / (W * 0.55);
          const dy = (y - H / 2) / (H * 0.55);
          const f = clamp(1 - Math.hypot(dx, dy));
          if (f <= 0.03) continue;
          ctx.fillStyle = col(a * f * 0.85, 60);
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }
      ctx.restore();
    }

    function nebula(t: number, a: number) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let k = 0; k < 3; k++) {
        const ph = t * 0.11 + k * 2.1;
        const x = W * (0.5 + 0.3 * Math.sin(ph));
        const y = H * (0.5 + 0.24 * Math.cos(ph * 1.3));
        const r = Math.min(W, H) * (0.35 + 0.12 * k);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, col(0.1 * a, 44));
        g.addColorStop(0.6, col(0.04 * a, 34));
        g.addColorStop(1, col(0, 30));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    function plexus(t: number) {
      const a = smooth(t, 5.05, 5.75) * (1 - smooth(t, 6.95, 7.55));
      if (a <= 0.01) return;

      nebula(t, a);

      const NEAR = 0.14;
      const SPAN = 1.4;
      const proj = [];
      for (const p of PTS) {
        let z = p.z0 - (t - 5.0) * p.v;
        z = NEAR + (((z - NEAR) % SPAN) + SPAN) % SPAN;
        const f = 0.85 / z;
        proj.push({
          x: W / 2 + p.x * f * W * 0.42,
          y: H / 2 + p.y * f * H * 0.42,
          d: clamp(1.3 - z * 0.72),
          big: p.big,
        });
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      const MAX = Math.min(W, H) * 0.38;
      const M = W * 0.6;
      for (let i = 0; i < proj.length; i++) {
        const A = proj[i];
        if (A.x < -M || A.x > W + M || A.y < -M || A.y > H + M) continue;
        for (let j = i + 1; j < proj.length; j++) {
          const B = proj[j];
          const dx = A.x - B.x;
          const dy = A.y - B.y;
          const dist = Math.hypot(dx, dy);
          if (dist > MAX) continue;
          const s = (1 - dist / MAX) * Math.min(A.d, B.d) * a;
          if (s < 0.015) continue;
          ctx.strokeStyle = col(s * 1.15, 66);
          ctx.lineWidth = 0.7 + s * 0.9;
          ctx.beginPath();
          ctx.moveTo(A.x, A.y);
          ctx.lineTo(B.x, B.y);
          ctx.stroke();
        }
      }

      for (const P of proj) {
        if (!P.big) continue;
        ctx.fillStyle = col(P.d * a, 78);
        ctx.shadowBlur = 12;
        ctx.shadowColor = col(P.d * a, 66);
        ctx.beginPath();
        ctx.arc(P.x, P.y, 1.8 + P.d * 2.4, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    }

    function title(t: number) {
      const a = smooth(t, 7.15, 7.85) * (1 - smooth(t, 8.05, 8.45));
      if (a <= 0.01 || !CFG.logo) return;

      const size = Math.min(W, H) * 0.085;
      const tracking = (1 - outCube(seg(t, 7.15, 8.1))) * size * 0.55 + size * 0.14;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.font = `700 ${size}px "Rajdhani","Inter",sans-serif`;
      ctx.textBaseline = "middle";

      const chars = [...CFG.logo];
      let total = -tracking;
      for (const ch of chars) total += ctx.measureText(ch).width + tracking;

      let x = W / 2 - total / 2;
      const y = H / 2;
      ctx.shadowBlur = 18;
      ctx.shadowColor = col(a * 0.8, 60);
      for (const ch of chars) {
        ctx.fillStyle = `hsla(0,0%,100%,${a * 0.92})`;
        ctx.fillText(ch, x, y);
        x += ctx.measureText(ch).width + tracking;
      }
      ctx.shadowBlur = 0;

      const lw = total * outCube(seg(t, 7.45, 8.25));
      const ly = y + size * 0.85;
      const lg = ctx.createLinearGradient(W / 2 - lw / 2, 0, W / 2 + lw / 2, 0);
      lg.addColorStop(0, col(0, 60));
      lg.addColorStop(0.5, col(a * 0.85, 68));
      lg.addColorStop(1, col(0, 60));
      ctx.fillStyle = lg;
      ctx.fillRect(W / 2 - lw / 2, ly, lw, 1.5);
      ctx.restore();
    }

    function render(t: number) {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      background(t);

      const open = Math.pow(Math.sin(Math.PI * seg(t, 0.1, 1.7)), 1.7);
      flare(open, 0.035 + 0.2 * open);
      shockwave(t);

      hud(t);
      hexMesh(t);
      plexus(t);

      const endBurst = Math.pow(Math.sin(Math.PI * seg(t, 6.8, 7.7)), 1.6);
      flare(endBurst * 0.95, 0.05 + 0.22 * endBurst);

      title(t);

      const recall = Math.pow(Math.sin(Math.PI * seg(t, 7.95, 8.62)), 1.4);
      flare(recall * 0.88, 0.035 + 0.105 * recall);

      const fin = 1 - smooth(t, 0, 0.12);
      if (fin > 0) {
        ctx.fillStyle = `rgba(0,0,0,${fin})`;
        ctx.fillRect(0, 0, W, H);
      }
    }

    function handoff() {
      if (handed) return;
      handed = true;
      skipBtn!.classList.add("off");

      let r = core!.getBoundingClientRect();
      if (r.top < 40 || r.bottom > innerHeight - 40) {
        scrollTo(0, Math.max(0, scrollY + r.top + r.height / 2 - innerHeight / 2));
        r = core!.getBoundingClientRect();
      }

      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      orb!.style.left = cx - 35 + "px";
      orb!.style.top = cy - 35 + "px";
      orb!.style.transform = `translate(${innerWidth / 2 - cx}px, ${innerHeight / 2 - cy}px) scale(4.2)`;
      orb!.classList.add("lit");
      void orb!.offsetWidth;

      document.body.classList.remove("booting");
      layer!.classList.add("off");

      requestAnimationFrame(() => {
        orb!.classList.add("travel");
        orb!.style.transform = "translate(0, 0) scale(1)";
      });

      setTimeout(() => {
        core?.classList.add("on");
        rings.forEach((el, i) => setTimeout(() => el.classList.add("on"), i * 130));
        ekg?.classList.add("on");
        orb!.classList.add("gone");
        setTimeout(() => {
          running = false;
          setVisible(false);
        }, 700);
      }, 1120);
    }

    function frame(now: number) {
      if (!running) return;
      const t = ((now - t0) / 1000) * CFG.speed;
      render(Math.min(t, CFG.handoff));
      if (t >= CFG.handoff) handoff();
      rafId = requestAnimationFrame(frame);
    }

    function skip() {
      t0 = performance.now() - (CFG.handoff / CFG.speed) * 1000;
    }
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") skip();
    }
    skipBtn.addEventListener("click", skip);
    layer.addEventListener("click", skip);
    window.addEventListener("keydown", onKeydown);

    resize();
    t0 = performance.now();
    rafId = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeydown);
      skipBtn.removeEventListener("click", skip);
      layer.removeEventListener("click", skip);
      document.body.classList.remove("booting");
    };
    // Ne joue qu'une fois au montage de l'accueil — un changement de thème ou
    // de route démonte ce composant plutôt que de relancer l'intro en place.
  }, [mounted]);

  if (!visible || !mounted) return null;

  return createPortal(
    <>
      <div id="intro-layer" ref={layerRef}>
        <canvas id="intro-canvas" ref={canvasRef} />
      </div>
      <div id="orb" ref={orbRef} />
      <button id="intro-skip" type="button" ref={skipRef}>
        PASSER
      </button>
    </>,
    document.body
  );
}
