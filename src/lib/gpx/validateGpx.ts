import { distance as turfDistance, point as turfPoint } from '@turf/turf';

export const MIN_TRACK_POINT_COUNT = 10;
export const MAX_POINT_GAP_M = 700;

export type GpxValidationResult = { valid: true } | { valid: false; reason: string };

export function validateGpx(xmlString: string): GpxValidationResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  if (doc.getElementsByTagName('parsererror').length > 0) {
    return { valid: false, reason: 'File is not valid XML.' };
  }

  const trackPoints = Array.from(doc.getElementsByTagName('trkpt'));
  if (trackPoints.length === 0) {
    return {
      valid: false,
      reason:
        'No recorded track found. Upload a dense recorded track (a GPX <trk>), not a route-planning file.',
    };
  }

  if (trackPoints.length < MIN_TRACK_POINT_COUNT) {
    return {
      valid: false,
      reason: `Track has too few points (${trackPoints.length}), at least ${MIN_TRACK_POINT_COUNT} are required.`,
    };
  }

  const coords = trackPoints.map((el) => ({
    lat: Number(el.getAttribute('lat')),
    lng: Number(el.getAttribute('lon')),
  }));

  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const gapM = turfDistance(turfPoint([prev.lng, prev.lat]), turfPoint([curr.lng, curr.lat]), {
      units: 'meters',
    });
    if (gapM > MAX_POINT_GAP_M) {
      return {
        valid: false,
        reason: `Gap of ${Math.round(gapM)}m between consecutive points exceeds the ${MAX_POINT_GAP_M}m limit.`,
      };
    }
  }

  return { valid: true };
}
