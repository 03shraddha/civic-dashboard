import { GeoJSON } from 'react-leaflet';
import { Layer, PathOptions, LeafletMouseEvent } from 'leaflet';
import { useStore } from '../../store';
import { scoreToColor } from '../../utils/colorScale';
import { WardStats } from '../../types/ward';
import type { Feature } from 'geojson';

export function ChoroplethLayer() {
  const {
    wardBoundaries, wardStats,
    setHoveredWardName,
    activeWardName, setActiveWardName,
    activeConstituency, constituencyWardMap,
  } = useStore();

  if (!wardBoundaries) return null;

  const activeWardSet: Set<string> | null = activeConstituency
    ? new Set(constituencyWardMap.get(activeConstituency) ?? [])
    : null;

  function getWardName(feature: Feature): string {
    const props = feature.properties || {};
    return props.KGISWardName ?? props.WARD_NAME ?? '';
  }

  function style(feature?: Feature): PathOptions {
    if (!feature) return {};
    const wardName = getWardName(feature);
    const stats: WardStats | undefined = wardStats.get(wardName);
    const score = stats?.frustrationScore ?? 0;
    const isDimmed = activeWardSet !== null && !activeWardSet.has(wardName);

    if (isDimmed) {
      return {
        fillColor: score > 0 ? scoreToColor(score) : '#f1f5f9',
        fillOpacity: 0.1,
        color: '#e2e8f0',
        weight: 0.5,
        opacity: 0.4,
      };
    }

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
      click: () => {
        setHoveredWardName(null);
        setActiveWardName(activeWardName === wardName ? null : wardName);
      },
      mouseover: (e: LeafletMouseEvent) => {
        if (activeWardName) return;
        e.target.setStyle({ weight: 2, color: '#6366f1', fillOpacity: 0.9 });
        e.target.bringToFront();
        setHoveredWardName(wardName);
      },
      mouseout: (e: LeafletMouseEvent) => {
        if (activeWardName) return;
        const score = wardStats.get(wardName)?.frustrationScore ?? 0;
        const isDimmed = activeWardSet !== null && !activeWardSet.has(wardName);
        e.target.setStyle({
          weight: isDimmed ? 0.5 : 0.8,
          color: isDimmed ? '#e2e8f0' : '#cbd5e1',
          fillOpacity: isDimmed ? 0.1 : score > 0 ? 0.75 : 0.4,
          opacity: isDimmed ? 0.4 : 1,
        });
        setHoveredWardName(null);
      },
    });
  }

  return (
    <GeoJSON
      key={`choropleth-${wardStats.size}-${activeWardName ?? 'none'}-${activeConstituency ?? 'all'}`}
      data={wardBoundaries}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}
