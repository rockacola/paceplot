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

  const distanceM = paceToSpeedMps(runner.pace.minPerKm) * elapsedSeconds;
  if (distanceM > route.totalDistanceM) return null;

  return pointAtDistance(route.points, distanceM);
}
