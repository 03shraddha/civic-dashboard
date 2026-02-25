import { useStore } from '../../store';
import { PulseMarker } from './PulseMarker';

// Only show pulses for the top 12 highest-stress wards (score ≥ 0.55)
// Keeps the canvas calm — dense lower-score wards don't add noise
const MAX_PULSES = 12;
const MIN_SCORE = 0.55;

export function PulseLayer() {
  const { centroids, wardStats, showPulses } = useStore();

  if (!showPulses) return null;

  const topWards = centroids
    .map(c => ({ centroid: c, score: wardStats.get(c.wardName)?.frustrationScore ?? 0 }))
    .filter(x => x.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PULSES);

  return (
    <>
      {topWards.map(({ centroid, score }) => (
        <PulseMarker key={centroid.wardName} centroid={centroid} score={score} />
      ))}
    </>
  );
}
