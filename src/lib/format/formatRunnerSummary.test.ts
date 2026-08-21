import { describe, expect, it } from 'vitest';
import { formatRunnerSummary } from './formatRunnerSummary';
import type { Runner } from '../../types/runner';

function makeRunner(overrides: Partial<Runner>): Runner {
  return {
    id: 'runner',
    name: 'Runner 1',
    startTime: new Date('2026-08-20T07:30:00'),
    pace: { minPerKm: 5 },
    color: '#2563eb',
    ...overrides,
  };
}

describe('formatRunnerSummary', () => {
  it('formats a whole-minute pace with :00 seconds', () => {
    const runner = makeRunner({
      startTime: new Date('2026-08-20T07:30:00'),
      pace: { minPerKm: 5 },
    });
    expect(formatRunnerSummary(runner)).toBe('Runner 1 starts 7:30 AM @ 5:00/km');
  });

  it('formats a partial-minute pace with rounded seconds', () => {
    const runner = makeRunner({ pace: { minPerKm: 5.5 } });
    expect(formatRunnerSummary(runner)).toBe('Runner 1 starts 7:30 AM @ 5:30/km');
  });

  it('pads single-digit seconds', () => {
    const runner = makeRunner({ pace: { minPerKm: 6 + 5 / 60 } });
    expect(formatRunnerSummary(runner)).toBe('Runner 1 starts 7:30 AM @ 6:05/km');
  });

  it('formats a PM start time', () => {
    const runner = makeRunner({ startTime: new Date('2026-08-20T18:05:00') });
    expect(formatRunnerSummary(runner)).toBe('Runner 1 starts 6:05 PM @ 5:00/km');
  });

  it('uses the runner name given', () => {
    const runner = makeRunner({ name: 'Runner 2' });
    expect(formatRunnerSummary(runner)).toBe('Runner 2 starts 7:30 AM @ 5:00/km');
  });
});
