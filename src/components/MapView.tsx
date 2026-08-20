import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import '../lib/leafletIconFix';
import { DEFAULT_RUNNER_COLOR } from '../config/runnerDefaults';
import type { Route } from '../types/route';

const DEFAULT_CENTER: [number, number] = [0, 0];
const DEFAULT_ZOOM = 2;
const DOT_DIAMETER_PX = 16;

type MapViewProps = {
  route: Route | null;
  runnerPosition: { lat: number; lng: number } | null;
  runnerColor?: string;
};

function FitRouteBounds({ route }: { route: Route }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(route.points.map((p) => [p.lat, p.lng]));
  }, [map, route]);
  return null;
}

function createDotIcon(color: string) {
  return L.divIcon({
    className: 'runner-dot-marker',
    html: `<span style="display:block;width:${DOT_DIAMETER_PX}px;height:${DOT_DIAMETER_PX}px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(15,23,42,0.35);"></span>`,
    iconSize: [DOT_DIAMETER_PX, DOT_DIAMETER_PX],
    iconAnchor: [DOT_DIAMETER_PX / 2, DOT_DIAMETER_PX / 2],
  });
}

export function MapView({
  route,
  runnerPosition,
  runnerColor = DEFAULT_RUNNER_COLOR,
}: MapViewProps) {
  const dotIcon = useMemo(() => createDotIcon(runnerColor), [runnerColor]);

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
      {runnerPosition && (
        <Marker position={[runnerPosition.lat, runnerPosition.lng]} icon={dotIcon} />
      )}
    </MapContainer>
  );
}
