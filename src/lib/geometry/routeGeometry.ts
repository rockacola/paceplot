import { along, distance as turfDistance, lineString, point as turfPoint } from '@turf/turf';
import type { RoutePoint } from '../../types/route';

export type RawPoint = { lat: number; lng: number };

export function buildRoutePoints(rawPoints: RawPoint[]): RoutePoint[] {
  let cumulative = 0;
  return rawPoints.map((p, i) => {
    if (i > 0) {
      const prev = rawPoints[i - 1];
      cumulative += turfDistance(turfPoint([prev.lng, prev.lat]), turfPoint([p.lng, p.lat]), {
        units: 'meters',
      });
    }
    return { lat: p.lat, lng: p.lng, cumulativeDistanceM: cumulative };
  });
}

export function pointAtDistance(points: RoutePoint[], distanceM: number): RawPoint {
  const first = points[0];
  const last = points[points.length - 1];
  const clamped = Math.min(
    Math.max(distanceM, first.cumulativeDistanceM),
    last.cumulativeDistanceM
  );

  if (clamped === first.cumulativeDistanceM) return { lat: first.lat, lng: first.lng };
  if (clamped === last.cumulativeDistanceM) return { lat: last.lat, lng: last.lng };

  const line = lineString(points.map((p) => [p.lng, p.lat]));
  const result = along(line, clamped, { units: 'meters' });
  const [lng, lat] = result.geometry.coordinates;
  return { lat, lng };
}
