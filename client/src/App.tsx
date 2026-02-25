import { useEffect, useState, useCallback } from 'react';
import { MapContainer } from './components/map/MapContainer';
import { ChoroplethLayer } from './components/map/ChoroplethLayer';
import { PulseLayer } from './components/map/PulseLayer';
import { HoverPanel } from './components/map/HoverPanel';
import { WardDrawer } from './components/map/WardDrawer';
import { CategoryExplainer } from './components/map/CategoryExplainer';
import { ConstituencyZoomer } from './components/map/ConstituencyZoomer';
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
      background: '#f8fafc',
    }}>
      <TopBar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <ErrorBoundary>
            <MapContainer>
              <ChoroplethLayer />
              <PulseLayer />
              <ConstituencyZoomer />
            </MapContainer>
          </ErrorBoundary>

          <CategoryExplainer />
          <HoverPanel />
          <WardDrawer />
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
