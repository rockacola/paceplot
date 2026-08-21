import { describe, expect, it } from 'vitest';
import { getTimelineRange } from './timelineRange';
import { buildRoutePoints } from '../geometry/routeGeometry';
import type { Route } from '../../types/route';
import type { Runner } from '../../types/runner';

const points = buildRoutePoints([
  { lat: -33.8688, lng: 151.2093 },
  { lat: -33.8683, lng: 151.2093 },
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

describe('getTimelineRange', () => {
  it('collapses to a single point with no runners', () => {
    const { rangeStart, rangeEnd } = getTimelineRange(route, []);
    expect(rangeStart.getTime()).toBe(rangeEnd.getTime());
  });

  it('collapses to the start time with one runner and no route', () => {
    const runner = makeRunner({ startTime: new Date('2026-08-20T08:00:00Z') });
    const { rangeStart, rangeEnd } = getTimelineRange(null, [runner]);
    expect(rangeStart.getTime()).toBe(runner.startTime.getTime());
    expect(rangeEnd.getTime()).toBe(rangeStart.getTime());
  });

  it('spans from start to finish for a single runner with a route', () => {
    const runner = makeRunner({ startTime: new Date('2026-08-20T08:00:00Z') });
    const { rangeStart, rangeEnd } = getTimelineRange(route, [runner]);
    expect(rangeStart.getTime()).toBe(runner.startTime.getTime());
    expect(rangeEnd.getTime()).toBeGreaterThan(rangeStart.getTime());
  });

  it('uses the earliest start and the latest finish across multiple runners', () => {
    const early = makeRunner({
      id: 'early',
      startTime: new Date('2026-08-20T07:00:00Z'),
      pace: { minPerKm: 10 }, // slow, but starts earliest
    });
    const late = makeRunner({
      id: 'late',
      startTime: new Date('2026-08-20T09:00:00Z'),
      pace: { minPerKm: 3 }, // fast, but starts latest
    });
    const { rangeStart, rangeEnd } = getTimelineRange(route, [early, late]);

    expect(rangeStart.getTime()).toBe(early.startTime.getTime());

    const earlyFinish = new Date(
      early.startTime.getTime() + (route.totalDistanceM / (1000 / (10 * 60))) * 1000
    ).getTime();
    const lateFinish = new Date(
      late.startTime.getTime() + (route.totalDistanceM / (1000 / (3 * 60))) * 1000
    ).getTime();
    expect(rangeEnd.getTime()).toBe(Math.max(earlyFinish, lateFinish));
  });
});
