import { getRunnerPosition } from './position';
import type { Route } from '../../types/route';
import type { Runner } from '../../types/runner';

export type RunnerPosition = {
  id: string;
  color: string;
  lat: number;
  lng: number;
};

export function getRunnersPositions(
  route: Route | null,
  runners: Runner[],
  clockTime: Date
): RunnerPosition[] {
  if (!route) return [];

  const positions: RunnerPosition[] = [];
  for (const runner of runners) {
    const position = getRunnerPosition(route, runner, clockTime);
    if (position) {
      positions.push({ id: runner.id, color: runner.color, ...position });
    }
  }
  return positions;
}
