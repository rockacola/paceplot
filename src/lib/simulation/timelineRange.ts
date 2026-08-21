import { paceToSpeedMps } from './pace';
import type { Route } from '../../types/route';
import type { Runner } from '../../types/runner';

export function getTimelineRange(
  route: Route | null,
  runners: Runner[]
): { rangeStart: Date; rangeEnd: Date } {
  if (runners.length === 0) {
    const epoch = new Date(0);
    return { rangeStart: epoch, rangeEnd: epoch };
  }

  const rangeStart = new Date(Math.min(...runners.map((r) => r.startTime.getTime())));

  if (!route || route.totalDistanceM === 0) {
    return { rangeStart, rangeEnd: rangeStart };
  }

  const finishTimes = runners.map((runner) => {
    const speedMps = paceToSpeedMps(runner.pace.minPerKm);
    const durationMs = (route.totalDistanceM / speedMps) * 1000;
    return runner.startTime.getTime() + durationMs;
  });

  return { rangeStart, rangeEnd: new Date(Math.max(...finishTimes)) };
}
