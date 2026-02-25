import { useEffect } from 'react';
import { MapContainer } from './components/map/MapContainer';
import { ChoroplethLayer } from './components/map/ChoroplethLayer';
import { PulseLayer } from './components/map/PulseLayer';
import { HoverPanel } from './components/map/HoverPanel';
import { MapLegend } from './components/map/MapLegend';
import { TopBar } from './components/layout/TopBar';
import { ComparisonCards } from './components/cards/ComparisonCards';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { useWardBoundaries } from './hooks/useWardBoundaries';
import { useWardStats } from './hooks/useWardStats';
import { useCityStats } from './hooks/useCityStats';

function MapApp() {
  // Load all data
  useWardBoundaries();
  useWardStats();
  useCityStats();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Top bar */}
      <TopBar />

      {/* Map - full screen */}
      <div style={{ position: 'absolute', inset: 0, paddingTop: '60px' }}>
        <ErrorBoundary>
          <MapContainer>
            <ChoroplethLayer />
            <PulseLayer />
          </MapContainer>
        </ErrorBoundary>
      </div>

      {/* Overlaid panels */}
      <HoverPanel />
      <MapLegend />
      <ComparisonCards />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    document.title = 'Civic Pulse — Bengaluru';
  }, []);

  return (
    <ErrorBoundary>
      <MapApp />
    </ErrorBoundary>
  );
}
