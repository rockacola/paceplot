import { buildRoutePoints } from '../geometry/routeGeometry';
import type { Route } from '../../types/route';

export function parseGpx(xmlString: string): Route {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  const rawPoints = Array.from(doc.getElementsByTagName('trkpt')).map((el) => ({
    lat: Number(el.getAttribute('lat')),
    lng: Number(el.getAttribute('lon')),
  }));

  const points = buildRoutePoints(rawPoints);
  const totalDistanceM = points.length > 0 ? points[points.length - 1].cumulativeDistanceM : 0;

  const trackNameEl = doc.getElementsByTagName('trk')[0]?.getElementsByTagName('name')[0];
  const name = trackNameEl?.textContent?.trim() || 'Untitled route';

  return {
    id: crypto.randomUUID(),
    name,
    points,
    totalDistanceM,
  };
}
