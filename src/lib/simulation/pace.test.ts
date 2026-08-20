import { describe, expect, it } from 'vitest';
import { paceToSpeedMps, speedToPaceMinPerKm } from './pace';

describe('paceToSpeedMps', () => {
  it('converts a 5 min/km pace to roughly 3.33 m/s', () => {
    expect(paceToSpeedMps(5)).toBeCloseTo(1000 / 300, 5);
  });

  it('converts a 4 min/km pace to a faster speed than a 6 min/km pace', () => {
    expect(paceToSpeedMps(4)).toBeGreaterThan(paceToSpeedMps(6));
  });
});

describe('speedToPaceMinPerKm', () => {
  it('is the inverse of paceToSpeedMps', () => {
    const speed = paceToSpeedMps(5.5);
    expect(speedToPaceMinPerKm(speed)).toBeCloseTo(5.5, 5);
  });
});
