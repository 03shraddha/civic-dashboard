import { useEffect, useState, useCallback } from 'react';
import { MapContainer } from './components/map/MapContainer';
import { ChoroplethLayer } from './components/map/ChoroplethLayer';
import { PulseLayer } from './components/map/PulseLayer';
import { HoverPanel } from './components/map/HoverPanel';
import { MapLegend } from './components/map/MapLegend';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#020617',
    }}>
      {/* Top bar — branding + status only */}
      <TopBar />

      {/* Main content: sidebar + map */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left sidebar — controls + intelligence */}
        <Sidebar />

        {/* Map viewport */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <ErrorBoundary>
            <MapContainer>
              <ChoroplethLayer />
              <PulseLayer />
            </MapContainer>
          </ErrorBoundary>

          {/* Map overlays */}
          <HoverPanel />
          <MapLegend />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch('/health')
      .then(r => r.json())
      .then(d => { if (d.cachedWindows?.length > 0) setReady(true); })
      .catch(() => setReady(true));
  }, []);

  const handleReady = useCallback(() => setReady(true), []);

  if (!ready) return <WarmingUp onReady={handleReady} />;

  return (
    <ErrorBoundary>
      <MapApp />
    </ErrorBoundary>
  );
}
