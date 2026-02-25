import { useEffect, useState, useCallback } from 'react';
import { MapContainer } from './components/map/MapContainer';
import { ChoroplethLayer } from './components/map/ChoroplethLayer';
import { PulseLayer } from './components/map/PulseLayer';
import { HoverPanel } from './components/map/HoverPanel';
import { MapLegend } from './components/map/MapLegend';
import { TopBar } from './components/layout/TopBar';
import { ComparisonCards } from './components/cards/ComparisonCards';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { WarmingUp } from './components/shared/WarmingUp';
import { useWardBoundaries } from './hooks/useWardBoundaries';
import { useWardStats } from './hooks/useWardStats';
import { useCityStats } from './hooks/useCityStats';

function MapApp() {
  useWardBoundaries();
  useWardStats();
  useCityStats();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <TopBar />
      <div style={{ position: 'absolute', inset: 0, paddingTop: '60px' }}>
        <ErrorBoundary>
          <MapContainer>
            <ChoroplethLayer />
            <PulseLayer />
          </MapContainer>
        </ErrorBoundary>
      </div>
      <HoverPanel />
      <MapLegend />
      <ComparisonCards />
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  // Check if server already has cached data (not a cold start)
  useEffect(() => {
    fetch('/health')
      .then(r => r.json())
      .then(d => { if (d.cachedWindows?.length > 0) setReady(true); })
      .catch(() => setReady(true)); // if health check fails, show map anyway
  }, []);

  const handleReady = useCallback(() => setReady(true), []);

  if (!ready) return <WarmingUp onReady={handleReady} />;

  return (
    <ErrorBoundary>
      <MapApp />
    </ErrorBoundary>
  );
}
