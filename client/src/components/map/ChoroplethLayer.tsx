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
      fillColor: score > 0 ? scoreToColor(score) : '#f1f5f9',
      fillOpacity: score > 0 ? 0.75 : 0.4,
      color: '#cbd5e1',
      weight: 0.8,
      opacity: 1,
    };
  }

  function onEachFeature(feature: Feature, layer: Layer) {
    const wardName = getWardName(feature);

    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        e.target.setStyle({ weight: 2, color: '#6366f1', fillOpacity: 0.9 });
        e.target.bringToFront();
        setHoveredWardName(wardName);
      },
      mouseout: (e: LeafletMouseEvent) => {
        const score = wardStats.get(wardName)?.frustrationScore ?? 0;
        e.target.setStyle({
          weight: 0.8,
          color: '#cbd5e1',
          fillOpacity: score > 0 ? 0.75 : 0.4,
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
