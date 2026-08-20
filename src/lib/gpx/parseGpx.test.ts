import { describe, expect, it } from 'vitest';
import { parseGpx } from './parseGpx';
import cleanTrack from './fixtures/clean-track.gpx?raw';

describe('parseGpx', () => {
  it('parses trkpt elements into route points with cumulative distance', () => {
    const route = parseGpx(cleanTrack);
    expect(route.points).toHaveLength(15);
    expect(route.points[0].cumulativeDistanceM).toBe(0);
    expect(route.points[14].cumulativeDistanceM).toBeGreaterThan(0);
  });

  it('sets totalDistanceM to the last point cumulative distance', () => {
    const route = parseGpx(cleanTrack);
    expect(route.totalDistanceM).toBe(route.points[route.points.length - 1].cumulativeDistanceM);
  });

  it('uses the track name from the GPX file', () => {
    const route = parseGpx(cleanTrack);
    expect(route.name).toBe('Clean Test Track');
  });

  it('assigns a unique id to each parsed route', () => {
    const routeA = parseGpx(cleanTrack);
    const routeB = parseGpx(cleanTrack);
    expect(routeA.id).not.toBe(routeB.id);
  });

  it('falls back to a default name when the GPX has none', () => {
    const xml = `<?xml version="1.0"?><gpx><trk><trkseg>
      <trkpt lat="-33.8688" lon="151.2093"></trkpt>
      <trkpt lat="-33.8683" lon="151.2093"></trkpt>
    </trkseg></trk></gpx>`;
    const route = parseGpx(xml);
    expect(route.name).toBe('Untitled route');
  });
});
