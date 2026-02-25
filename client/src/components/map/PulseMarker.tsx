import { DivIcon, divIcon } from 'leaflet';
import { Marker } from 'react-leaflet';
import { WardCentroid } from '../../types/ward';

interface Props {
  centroid: WardCentroid;
  score: number;
}

export function PulseMarker({ centroid, score }: Props) {
  // Single color per severity band — amber for moderate, red for severe
  const color = score >= 0.75 ? '#ef4444' : '#f59e0b';
  const duration = Math.max(1.0, 2.4 - score * 1.6);
  const size = 18; // fixed size — pulse animation conveys intensity

  const icon: DivIcon = divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;pointer-events:none;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          border:1.5px solid ${color};opacity:0.7;
          animation:pulse-ring ${duration}s ease-out infinite;
        "></div>
        <div style="
          position:absolute;inset:30%;border-radius:50%;
          background:${color};opacity:0.85;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

  return (
    <Marker
      position={[centroid.lat, centroid.lng]}
      icon={icon}
      interactive={false}
    />
  );
}
