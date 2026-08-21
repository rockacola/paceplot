import { describe, expect, it } from 'vitest';
import { getRunnersPositions } from './getRunnersPositions';
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

function makeRunner(overrides: Partial<Runner>): Runner {
  return {
    id: 'runner',
    name: 'Runner',
    startTime: new Date('2026-08-20T08:00:00Z'),
    pace: { minPerKm: 5 },
    color: '#2563eb',
    ...overrides,
  };
}

describe('getRunnersPositions', () => {
  it('returns an empty list with no route', () => {
    const runner = makeRunner({});
    expect(getRunnersPositions(null, [runner], runner.startTime)).toEqual([]);
  });

  it('pairs each started runner with its id, color, and position', () => {
    const a = makeRunner({ id: 'a', color: '#ff0000' });
    const b = makeRunner({ id: 'b', color: '#00ff00' });
    const clockTime = a.startTime;

    const positions = getRunnersPositions(route, [a, b], clockTime);

    expect(positions).toHaveLength(2);
    expect(positions[0]).toMatchObject({ id: 'a', color: '#ff0000' });
    expect(positions[0].lat).toBeCloseTo(-33.8688, 4);
    expect(positions[1]).toMatchObject({ id: 'b', color: '#00ff00' });
  });

  it('drops runners that have not started yet or have already finished', () => {
    const notStarted = makeRunner({
      id: 'not-started',
      startTime: new Date('2026-08-20T09:00:00Z'),
    });
    const finished = makeRunner({
      id: 'finished',
      startTime: new Date('2026-08-20T00:00:00Z'),
    });
    const clockTime = new Date('2026-08-20T08:00:00Z');

    const positions = getRunnersPositions(route, [notStarted, finished], clockTime);

    expect(positions).toEqual([]);
  });
});
