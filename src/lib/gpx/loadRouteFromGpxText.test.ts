import { describe, expect, it } from 'vitest';
import { loadRouteFromGpxText } from './loadRouteFromGpxText';
import cleanTrack from './fixtures/clean-track.gpx?raw';
import sparseRoute from './fixtures/sparse-route.gpx?raw';

describe('loadRouteFromGpxText', () => {
  it('returns a parsed route for valid GPX text', () => {
    const result = loadRouteFromGpxText(cleanTrack);
    expect('route' in result).toBe(true);
    if ('route' in result) {
      expect(result.route.name).toBe('Clean Test Track');
    }
  });

  it('returns an error for GPX text that fails validation, without parsing it', () => {
    const result = loadRouteFromGpxText(sparseRoute);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toMatch(/recorded track/i);
    }
  });
});
