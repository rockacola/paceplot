import { pointAtDistance } from '../geometry/routeGeometry';
import type { Route } from '../../types/route';

export type KmMarker = {
  km: number;
  lat: number;
  lng: number;
};

export function getKmMarkers(route: Route, intervalKm: number): KmMarker[] {
  const intervalM = intervalKm * 1000;
  const markers: KmMarker[] = [];

  for (let distanceM = intervalM; distanceM <= route.totalDistanceM; distanceM += intervalM) {
    const { lat, lng } = pointAtDistance(route.points, distanceM);
    markers.push({ km: distanceM / 1000, lat, lng });
  }

  return markers;
}
