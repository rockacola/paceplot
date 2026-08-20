import { validateGpx } from './validateGpx';
import { parseGpx } from './parseGpx';
import type { Route } from '../../types/route';

export type LoadRouteResult = { route: Route } | { error: string };

export function loadRouteFromGpxText(xmlString: string): LoadRouteResult {
  const validation = validateGpx(xmlString);
  if (!validation.valid) return { error: validation.reason };
  return { route: parseGpx(xmlString) };
}
