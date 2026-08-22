import { describe, expect, it } from 'vitest';
import { getRunnerPosition } from './position';
import { buildRoutePoints } from '../geometry/routeGeometry';
import type { Route } from '../../types/route';
import type { Runner } from '../../types/runner';

const points = buildRoutePoints([
  { lat: -33.8688, lng: 151.2093 },
  { lat: -33.8683, lng: 151.2093 },
  { lat: -33.8678, lng: 151.2093 },
]);
const route: Route = {
  id: 'route-1',
  name: 'Test route',
  points,
  totalDistanceM: points[points.length - 1].cumulativeDistanceM,
};

function makeRunner(overrides: Partial<Runner> = {}): Runner {
  return {
    id: 'runner-1',
    name: 'Test runner',
    startTime: new Date('2026-08-20T08:00:00Z'),
    pace: { minPerKm: 5 },
    color: '#2563eb',
    ...overrides,
  };
}

describe('getRunnerPosition', () => {
  it('returns null before the runner has started', () => {
    const runner = makeRunner();
    const clockTime = new Date('2026-08-20T07:59:00Z');
    expect(getRunnerPosition(route, runner, clockTime)).toBeNull();
  });

  it('returns the start point exactly at start time', () => {
    const runner = makeRunner();
    const position = getRunnerPosition(route, runner, runner.startTime);
    expect(position).not.toBeNull();
    expect(position?.lat).toBeCloseTo(-33.8688, 4);
  });

  it('stays at the finish line once the runner has finished the route, instead of disappearing', () => {
    const runner = makeRunner();
    const farFuture = new Date(runner.startTime.getTime() + 1000 * 60 * 60);
    const position = getRunnerPosition(route, runner, farFuture);
    const finish = points[points.length - 1];
    expect(position).toEqual({ lat: finish.lat, lng: finish.lng });
  });

  it('interpolates a position partway along the route', () => {
    const runner = makeRunner();
    const halfwaySeconds = ((route.totalDistanceM / 2) * (runner.pace.minPerKm * 60)) / 1000;
    const clockTime = new Date(runner.startTime.getTime() + halfwaySeconds * 1000);
    const position = getRunnerPosition(route, runner, clockTime);
    expect(position).not.toBeNull();
    expect(position?.lat).toBeGreaterThan(-33.8688);
    expect(position?.lat).toBeLessThan(-33.8678);
  });
});
