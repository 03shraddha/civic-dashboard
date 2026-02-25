// Restrained 3-stop scale: neutral slate → amber → red
// Neutral base blends with map background; amber = caution; red = severe
const STOPS: Array<{ score: number; r: number; g: number; b: number }> = [
  { score: 0.00, r: 0x1e, g: 0x29, b: 0x3b }, // slate-800  — low stress
  { score: 0.50, r: 0xf5, g: 0x9e, b: 0x0b }, // amber-500  — moderate
  { score: 1.00, r: 0xef, g: 0x44, b: 0x44 }, // red-500    — severe
];

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, '0');
}

export function scoreToColor(score: number): string {
  const clamped = Math.max(0, Math.min(1, score));

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
  return `#${toHex(lerp(lo.r, hi.r, t))}${toHex(lerp(lo.g, hi.g, t))}${toHex(lerp(lo.b, hi.b, t))}`;
}

export const LEGEND_STOPS = STOPS.map(s => ({
  score: s.score,
  color: `#${toHex(s.r)}${toHex(s.g)}${toHex(s.b)}`,
}));
