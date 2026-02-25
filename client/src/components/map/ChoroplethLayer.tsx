import { GeoJSON } from 'react-leaflet';
import { Layer, PathOptions, LeafletMouseEvent } from 'leaflet';
import { useStore } from '../../store';
import { scoreToColor } from '../../utils/colorScale';
import { WardStats } from '../../types/ward';
import type { Feature } from 'geojson';

export function ChoroplethLayer() {
  const { wardBoundaries, wardStats, activeConstituency, setHoveredWardName } = useStore();

  if (!wardBoundaries) return null;

  function getWardName(feature: Feature): string {
    const props = feature.properties || {};
    return props.KGISWardName ?? props.WARD_NAME ?? '';
  }

  function style(feature?: Feature): PathOptions {
    if (!feature) return {};
    const wardName = getWardName(feature);
    const stats: WardStats | undefined = wardStats.get(wardName);
    const score = stats?.frustrationScore ?? 0;
    const isActive = !activeConstituency || true; // constituency dimming handled via opacity

    return {
      fillColor: score > 0 ? scoreToColor(score) : '#1e293b',
      fillOpacity: isActive ? (score > 0 ? 0.75 : 0.3) : 0.2,
      color: '#334155',
      weight: 0.8,
      opacity: 0.6,
    };
  }

  function onEachFeature(feature: Feature, layer: Layer) {
    const wardName = getWardName(feature);

    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        const target = e.target;
        target.setStyle({
          weight: 2,
          color: '#94a3b8',
          fillOpacity: 0.9,
        });
        target.bringToFront();
        setHoveredWardName(wardName);
      },
      mouseout: (e: LeafletMouseEvent) => {
        const target = e.target;
        const stats = wardStats.get(wardName);
        const score = stats?.frustrationScore ?? 0;
        target.setStyle({
          weight: 0.8,
          color: '#334155',
          fillOpacity: score > 0 ? 0.75 : 0.3,
        });
        setHoveredWardName(null);
      },
    });
  }

  return (
    <GeoJSON
      key={`choropleth-${wardStats.size}`}
      data={wardBoundaries}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}
