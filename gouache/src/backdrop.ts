/**
 * Painted backdrop: flat angular paint planes (like a Fortiche environment painting) with one diagonal
 * light band and thin iridescent swirls, drawn as SVG. It is deterministic (seeded), so a given theme always
 * paints the same picture, and it is static, so it costs nothing after the first paint.
 *
 * Use `paintBackdrop(svgElement, { theme })`, or the <Backdrop/> React component.
 * For very slow devices pass `rough: false` (skips the SVG displacement filter) or render once to a PNG.
 */
import type { Theme } from "./theme.ts";

export interface Palette {
  /** Colour stops along the light axis (0 = shadowed side, 1 = lit side): [position, "#rrggbb"] */
  stops: [number, string][];
  /** Colour of the glow band */
  glow: string;
  /** Colours of the thin swirls */
  swirl: string[];
  /** 0..1, how much the lower part of the picture falls into shadow */
  shade: number;
}

/** Built-in palettes. Add your own with `registerPalette()`. */
const PALETTES: Record<string, Palette> = {
  light: {
    stops: [[0, "#a8a2b6"], [0.2, "#c2b6c4"], [0.34, "#d3c6cc"], [0.42, "#9fc5bb"], [0.5, "#bfe8c8"], [0.58, "#e6f6d8"], [0.68, "#f8eed6"], [1, "#f1dfc6"]],
    glow: "#d6ffe0",
    swirl: ["#f0b6d2", "#9fdde8", "#f1e49a"],
    shade: 0.12,
  },
  dark: {
    stops: [[0, "#17162a"], [0.2, "#272440"], [0.34, "#3f3a5a"], [0.42, "#1d4546"], [0.5, "#3fae94"], [0.58, "#9fdcb4"], [0.68, "#d3a98a"], [1, "#6e5048"]],
    glow: "#7fffd8",
    swirl: ["#f5b0cc", "#9fe6f0", "#f3e49a"],
    shade: 0.4,
  },
};

export function registerPalette(name: string, palette: Palette) {
  PALETTES[name] = palette;
}

export interface BackdropOptions {
  /** A built-in theme or the name of a palette added with registerPalette(). Default "dark". */
  theme?: Theme | (string & {});
  /** Roughen the plane edges with an SVG displacement filter. Default true. */
  rough?: boolean;
  /** Different seed = different (but still deterministic) painting. Default 11. */
  seed?: number;
}

const W = 800;
const H = 480;

type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const rgb = (c: number[]) => `rgb(${c.map((v) => Math.max(0, Math.min(255, v | 0))).join(",")})`;

/** mulberry32: tiny seeded random generator */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sample(stops: Palette["stops"], t: number): RGB {
  t = Math.max(0, Math.min(1, t));
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [p0, c0] = stops[i - 1];
      const [p1, c1] = stops[i];
      const k = (t - p0) / (p1 - p0);
      const a = hex(c0);
      const b = hex(c1);
      return a.map((v, j) => v + (b[j] - v) * k) as RGB;
    }
  }
  return hex(stops[stops.length - 1][1]);
}

/** SVG markup (inner content) of the backdrop. */
export function renderBackdrop({ theme = "dark", rough = true, seed = 11 }: BackdropOptions = {}): string {
  const P = PALETTES[theme] ?? PALETTES.dark;
  const R = rng(seed);
  // distance along the light axis: the band runs diagonally from top-centre to lower-right
  const field = (x: number, y: number) => 0.5 + ((x - 400) * 0.877 + (y - 240) * -0.48) / 640;

  /** One layer of jittered slab-shaped planes, rotated, some split into triangles. */
  const layer = (rot: number, cell: number, jitter: number, alpha: number, amp: number) => {
    const cw = cell * 1.5;
    const ch = cell * 0.62;
    const x0 = -420;
    const y0 = -420;
    const nx = Math.ceil(1640 / cw);
    const ny = Math.ceil(1640 / ch);
    const V: [number, number][][] = [];
    for (let j = 0; j <= ny; j++) {
      V[j] = [];
      for (let i = 0; i <= nx; i++) V[j][i] = [x0 + i * cw + (R() - 0.5) * jitter * cw, y0 + j * ch + (R() - 0.5) * jitter * ch];
    }
    const a = (rot * Math.PI) / 180;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const toScreen = (p: [number, number]): [number, number] => [400 + (p[0] - 400) * ca - (p[1] - 240) * sa, 240 + (p[0] - 400) * sa + (p[1] - 240) * ca];

    let s = `<g opacity="${alpha}">`;
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const q = [V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i]].map(toScreen);
        const cx = (q[0][0] + q[2][0]) / 2;
        const cy = (q[0][1] + q[2][1]) / 2;
        if (cx < -120 || cx > W + 120 || cy < -120 || cy > H + 120) continue;
        const parts = R() < 0.22 ? (R() < 0.5 ? [[q[0], q[1], q[2]], [q[0], q[2], q[3]]] : [[q[0], q[1], q[3]], [q[1], q[2], q[3]]]) : [q];
        for (const poly of parts) {
          const px = poly.reduce((acc, p) => acc + p[0], 0) / poly.length;
          const py = poly.reduce((acc, p) => acc + p[1], 0) / poly.length;
          const t = field(px, py) + (R() - 0.5) * 0.07; // ragged boundaries between zones
          const base = sample(P.stops, t);
          const d = (R() - 0.5) * 2 * amp; // value jitter per plane
          const c = base.map((v, k) => v + d + (R() - 0.5) * amp * 0.35 * (k - 1)); // slight hue drift
          const dark = (1 - P.shade * Math.pow(py / H, 1.6) * (t < 0.45 ? 1.4 : 0.6)) * (t < 0.4 ? 0.86 : 1);
          s += `<polygon points="${poly.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")}" fill="${rgb(c.map((v) => v * dark))}"/>`;
        }
      }
    }
    return s + "</g>";
  };

  let out = "";
  if (rough) {
    out += `<defs><filter id="g-edge" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`;
  }
  out += `<g${rough ? ' filter="url(#g-edge)"' : ""}>`;
  out += `<rect width="${W}" height="${H}" fill="${rgb(sample(P.stops, 0.2))}"/>`;
  out += layer(-18, 130, 0.4, 1, 13) + layer(9, 72, 0.45, 0.55, 7) + layer(-31, 38, 0.5, 0.22, 5);
  out += "</g>";

  // luminous band (screen-blended) …
  out += `<g style="mix-blend-mode:screen"><polygon points="300,-20 470,-20 700,500 520,500" fill="${P.glow}" opacity=".30" style="filter:blur(26px)"/></g>`;
  // … and thin iridescent swirls following it
  for (let k = 0; k < 6; k++) {
    const col = P.swirl[k % P.swirl.length];
    const o = 330 + R() * 210;
    const sh = (R() - 0.5) * 60;
    out += `<path d="M${o - 60 + sh},-10 C${o + 40},${120 + R() * 60} ${o + 10 + sh},${260 + R() * 60} ${o + 140 + sh},500" fill="none" stroke="${col}" stroke-width="${(1 + R() * 2.6).toFixed(1)}" stroke-opacity="${(0.22 + R() * 0.3).toFixed(2)}" stroke-linecap="round"/>`;
  }
  return out;
}

/** Paint the backdrop into an existing <svg> element (it should have viewBox="0 0 800 480" and preserveAspectRatio="xMidYMid slice"). */
export function paintBackdrop(svg: SVGSVGElement, opts: BackdropOptions = {}) {
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
  svg.innerHTML = renderBackdrop(opts);
}
