import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useStore } from '../../store';

export function ConstituencyZoomer() {
  const map = useMap();
  const { activeConstituency, constituencyWardMap, centroids } = useStore();

  useEffect(() => {
    if (!activeConstituency) return;

    const wardNames = constituencyWardMap.get(activeConstituency) ?? [];
    if (wardNames.length === 0) return;

    const wardSet = new Set(wardNames);
    const matching = centroids.filter(c => wardSet.has(c.wardName));
    if (matching.length === 0) return;

    const lats = matching.map(c => c.lat);
    const lngs = matching.map(c => c.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    map.flyToBounds(
      [[minLat - 0.01, minLng - 0.01], [maxLat + 0.01, maxLng + 0.01]],
      { padding: [20, 20], duration: 0.8 }
    );
  }, [activeConstituency, constituencyWardMap, centroids, map]);

  return null;
}
