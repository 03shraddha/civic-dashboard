import { GeoJSON } from 'react-leaflet';
import { Layer, PathOptions, LeafletMouseEvent } from 'leaflet';
import { useStore } from '../../store';
import { scoreToColor } from '../../utils/colorScale';
import { WardStats } from '../../types/ward';
import type { Feature } from 'geojson';

export function ChoroplethLayer() {
  const { wardBoundaries, wardStats, setHoveredWardName } = useStore();

  if (!wardBoundaries) return null;

  function getWardName(feature: Feature): string {
    const props = feature.properties || {};
    return props.KGISWardName ?? props.WARD_NAME ?? '';
  }

  function style(feature?: Feature): PathOptions {
    if (!feature) return {};
    const stats: WardStats | undefined = wardStats.get(getWardName(feature));
    const score = stats?.frustrationScore ?? 0;

    return {
      fillColor: score > 0 ? scoreToColor(score) : '#111827',
      fillOpacity: score > 0 ? 0.82 : 0.12,
      color: '#0f172a',
      weight: 0.5,
      opacity: 1,
    };
  }

  function onEachFeature(feature: Feature, layer: Layer) {
    const wardName = getWardName(feature);

    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        e.target.setStyle({ weight: 1.5, color: '#94a3b8', fillOpacity: 0.95 });
        e.target.bringToFront();
        setHoveredWardName(wardName);
      },
      mouseout: (e: LeafletMouseEvent) => {
        const score = wardStats.get(wardName)?.frustrationScore ?? 0;
        e.target.setStyle({
          weight: 0.5,
          color: '#0f172a',
          fillOpacity: score > 0 ? 0.82 : 0.12,
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
