import { describe, expect, it } from 'vitest';
import { getKmMarkers } from './getKmMarkers';
import { pointAtDistance } from '../geometry/routeGeometry';
import type { Route } from '../../types/route';

const route: Route = {
  id: 'route-1',
  name: 'Test route',
  points: [
    { lat: 0, lng: 0, cumulativeDistanceM: 0 },
    { lat: 1, lng: 0, cumulativeDistanceM: 22000 },
  ],
  totalDistanceM: 22000,
};

describe('getKmMarkers', () => {
  it('places a marker at every interval up to the total distance', () => {
    const markers = getKmMarkers(route, 5);
    expect(markers.map((m) => m.km)).toEqual([5, 10, 15, 20]);
  });

  it('includes a marker exactly at the finish when total distance is an exact multiple', () => {
    const exactRoute: Route = { ...route, totalDistanceM: 20000 };
    expect(getKmMarkers(exactRoute, 5).map((m) => m.km)).toEqual([5, 10, 15, 20]);
  });

  it('returns no markers when the route is shorter than one interval', () => {
    const shortRoute: Route = { ...route, totalDistanceM: 3000 };
    expect(getKmMarkers(shortRoute, 5)).toEqual([]);
  });

  it('respects a different interval', () => {
    const markers = getKmMarkers(route, 10);
    expect(markers.map((m) => m.km)).toEqual([10, 20]);
  });

  it('derives each marker position from pointAtDistance, consistent with the route geometry', () => {
    const markers = getKmMarkers(route, 5);
    const expected = pointAtDistance(route.points, 5000);
    expect(markers[0]).toEqual({ km: 5, lat: expected.lat, lng: expected.lng });
  });
});
