// 5-stop color scale: deep blue → teal → amber → orange → dark crimson
const STOPS: Array<{ score: number; r: number; g: number; b: number }> = [
  { score: 0.00, r: 0x1e, g: 0x3a, b: 0x5f },
  { score: 0.25, r: 0x0d, g: 0x73, b: 0x77 },
  { score: 0.50, r: 0xf4, g: 0xa5, b: 0x00 },
  { score: 0.75, r: 0xe8, g: 0x5d, b: 0x04 },
  { score: 1.00, r: 0x9b, g: 0x00, b: 0x00 },
];

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, '0');
}

export function scoreToColor(score: number): string {
  const clamped = Math.max(0, Math.min(1, score));

  // Find surrounding stops
  let lo = STOPS[0];
  let hi = STOPS[STOPS.length - 1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (clamped >= STOPS[i].score && clamped <= STOPS[i + 1].score) {
      lo = STOPS[i];
      hi = STOPS[i + 1];
      break;
    }
  }

  const t = hi.score === lo.score ? 0 : (clamped - lo.score) / (hi.score - lo.score);
  const r = lerp(lo.r, hi.r, t);
  const g = lerp(lo.g, hi.g, t);
  const b = lerp(lo.b, hi.b, t);

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export const LEGEND_STOPS = STOPS.map(s => ({
  score: s.score,
  color: `#${toHex(s.r)}${toHex(s.g)}${toHex(s.b)}`,
}));
