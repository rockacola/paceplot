import { describe, expect, it } from 'vitest';
import { buildRoutePoints, pointAtDistance } from './routeGeometry';

describe('buildRoutePoints', () => {
  it('assigns cumulativeDistanceM of 0 to the first point', () => {
    const points = buildRoutePoints([
      { lat: -33.8688, lng: 151.2093 },
      { lat: -33.8683, lng: 151.2093 },
    ]);
    expect(points[0].cumulativeDistanceM).toBe(0);
  });

  it('accumulates distance monotonically along a straight line', () => {
    const points = buildRoutePoints([
      { lat: -33.8688, lng: 151.2093 },
      { lat: -33.8683, lng: 151.2093 },
      { lat: -33.8678, lng: 151.2093 },
    ]);
    expect(points[1].cumulativeDistanceM).toBeGreaterThan(0);
    expect(points[2].cumulativeDistanceM).toBeGreaterThan(points[1].cumulativeDistanceM);
    // ~50m per step given the coordinate spacing used
    expect(points[1].cumulativeDistanceM).toBeCloseTo(55.6, 0);
    expect(points[2].cumulativeDistanceM).toBeCloseTo(111.2, 0);
  });

  it('returns an empty array for no input points', () => {
    expect(buildRoutePoints([])).toEqual([]);
  });
});

describe('pointAtDistance', () => {
  const points = buildRoutePoints([
    { lat: -33.8688, lng: 151.2093 },
    { lat: -33.8683, lng: 151.2093 },
    { lat: -33.8678, lng: 151.2093 },
  ]);

  it('returns the first point at distance 0', () => {
    const p = pointAtDistance(points, 0);
    expect(p.lat).toBeCloseTo(-33.8688, 4);
    expect(p.lng).toBeCloseTo(151.2093, 4);
  });

  it('returns the last point at the total distance', () => {
    const total = points[points.length - 1].cumulativeDistanceM;
    const p = pointAtDistance(points, total);
    expect(p.lat).toBeCloseTo(-33.8678, 4);
  });

  it('clamps distances beyond the route to the last point', () => {
    const total = points[points.length - 1].cumulativeDistanceM;
    const p = pointAtDistance(points, total + 1000);
    expect(p.lat).toBeCloseTo(-33.8678, 4);
  });

  it('clamps negative distances to the first point', () => {
    const p = pointAtDistance(points, -100);
    expect(p.lat).toBeCloseTo(-33.8688, 4);
  });

  it('interpolates a point partway along a segment', () => {
    const p = pointAtDistance(points, 27.8);
    expect(p.lat).toBeGreaterThan(-33.8688);
    expect(p.lat).toBeLessThan(-33.8683);
  });
});
