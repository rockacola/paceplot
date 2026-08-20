import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import '../lib/leafletIconFix';
import type { Route } from '../types/route';

const DEFAULT_CENTER: [number, number] = [0, 0];
const DEFAULT_ZOOM = 2;

type MapViewProps = {
  route: Route | null;
  runnerPosition: { lat: number; lng: number } | null;
};

function FitRouteBounds({ route }: { route: Route }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(route.points.map((p) => [p.lat, p.lng]));
  }, [map, route]);
  return null;
}

export function MapView({ route, runnerPosition }: MapViewProps) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      data-testid="map-view"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {route && (
        <>
          <Polyline positions={route.points.map((p) => [p.lat, p.lng])} />
          <FitRouteBounds route={route} />
        </>
      )}
      {runnerPosition && <Marker position={[runnerPosition.lat, runnerPosition.lng]} />}
    </MapContainer>
  );
}
