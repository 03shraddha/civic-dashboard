import { useStore } from '../../store';
import { PulseMarker } from './PulseMarker';
import { PULSE_THRESHOLD } from '../../constants/scoring';

export function PulseLayer() {
  const { centroids, wardStats } = useStore();

  return (
    <>
      {centroids.map(centroid => {
        const stats = wardStats.get(centroid.wardName);
        if (!stats || stats.frustrationScore < PULSE_THRESHOLD) return null;
        return (
          <PulseMarker
            key={centroid.wardName}
            centroid={centroid}
            score={stats.frustrationScore}
          />
        );
      })}
    </>
  );
}
