import { describe, expect, it } from 'vitest';
import { validateGpx } from './validateGpx';
import cleanTrack from './fixtures/clean-track.gpx?raw';
import sparseRoute from './fixtures/sparse-route.gpx?raw';
import tooFewPoints from './fixtures/too-few-points.gpx?raw';
import largeGap from './fixtures/large-gap.gpx?raw';

describe('validateGpx', () => {
  it('accepts a dense recorded track with no large gaps', () => {
    expect(validateGpx(cleanTrack)).toEqual({ valid: true });
  });

  it('rejects a sparse route-planning file with no trk element', () => {
    const result = validateGpx(sparseRoute);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toMatch(/recorded track/i);
    }
  });

  it('rejects a track with too few points', () => {
    const result = validateGpx(tooFewPoints);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toMatch(/point/i);
    }
  });

  it('rejects a track with a gap between consecutive points that is too large', () => {
    const result = validateGpx(largeGap);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toMatch(/gap/i);
    }
  });

  it('rejects malformed XML', () => {
    const result = validateGpx('<gpx><trk><trkseg>');
    expect(result.valid).toBe(false);
  });
});
