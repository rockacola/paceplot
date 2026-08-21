import { describe, expect, it } from 'vitest';
import { getTickIntervalMs, PLAYBACK_SPEED_OPTIONS, TICK_FPS_BY_SPEED } from './simulationConfig';

describe('getTickIntervalMs', () => {
  it('derives the interval from the configured fps for every playback speed', () => {
    for (const speed of PLAYBACK_SPEED_OPTIONS) {
      expect(getTickIntervalMs(speed)).toBe(Math.round(1000 / TICK_FPS_BY_SPEED[speed]));
    }
  });

  it('ticks less often at higher playback speeds', () => {
    const intervals = PLAYBACK_SPEED_OPTIONS.map(getTickIntervalMs);
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1]);
    }
  });
});
