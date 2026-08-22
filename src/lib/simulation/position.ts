import { pointAtDistance } from '../geometry/routeGeometry';
import { paceToSpeedMps } from './pace';
import type { Route } from '../../types/route';
import type { Runner } from '../../types/runner';

export function getRunnerPosition(
  route: Route,
  runner: Runner,
  clockTime: Date
): { lat: number; lng: number } | null {
  const elapsedSeconds = (clockTime.getTime() - runner.startTime.getTime()) / 1000;
  if (elapsedSeconds < 0) return null;

  // pointAtDistance clamps internally, so once finished this keeps returning
  // the finish-line point rather than nothing: the marker stays put instead
  // of disappearing when the runner completes the route.
  const distanceM = paceToSpeedMps(runner.pace.minPerKm) * elapsedSeconds;
  return pointAtDistance(route.points, distanceM);
}
