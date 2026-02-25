import { DivIcon, divIcon } from 'leaflet';
import { Marker } from 'react-leaflet';
import { WardCentroid } from '../../types/ward';
import { scoreToColor } from '../../utils/colorScale';

interface Props {
  centroid: WardCentroid;
  score: number;
}

export function PulseMarker({ centroid, score }: Props) {
  const color = scoreToColor(score);
  // Faster animation for higher scores
  const duration = Math.max(0.8, 2.2 - score * 1.4);
  const size = Math.round(10 + score * 20);

  const icon: DivIcon = divIcon({
    className: '',
    html: `
      <div class="pulse-wrapper" style="position:relative;width:${size}px;height:${size}px;">
        <div class="pulse-ring" style="
          position:absolute;
          inset:0;
          border-radius:50%;
          border:2px solid ${color};
          animation:pulse-ring ${duration}s linear infinite;
          opacity:0.8;
        "></div>
        <div class="pulse-ring" style="
          position:absolute;
          inset:0;
          border-radius:50%;
          border:2px solid ${color};
          animation:pulse-ring ${duration}s linear infinite;
          animation-delay:${duration / 2}s;
          opacity:0.5;
        "></div>
        <div style="
          position:absolute;
          inset:25%;
          border-radius:50%;
          background:${color};
          opacity:0.9;
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
