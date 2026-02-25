import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import { ReactNode } from 'react';
import {
  BENGALURU_CENTER,
  BENGALURU_DEFAULT_ZOOM,
  BENGALURU_BOUNDS,
  TILE_URL,
  TILE_ATTRIBUTION,
} from '../../constants/map';
import 'leaflet/dist/leaflet.css';
import '../../styles/map.css';

interface Props {
  children: ReactNode;
}

export function MapContainer({ children }: Props) {
  return (
    <LeafletMapContainer
      center={BENGALURU_CENTER}
      zoom={BENGALURU_DEFAULT_ZOOM}
      maxBounds={BENGALURU_BOUNDS}
      maxBoundsViscosity={0.9}
      minZoom={10}
      maxZoom={16}
      style={{ width: '100%', height: '100%' }}
      preferCanvas={true}
    >
      <TileLayer
        url={TILE_URL}
        attribution={TILE_ATTRIBUTION}
        subdomains="abcd"
        maxZoom={19}
      />
      {children}
    </LeafletMapContainer>
  );
}
