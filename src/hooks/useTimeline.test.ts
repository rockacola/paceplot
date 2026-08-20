import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimeline } from './useTimeline';
import { useSimulationStore } from '../store/simulationStore';
import { buildRoutePoints } from '../lib/geometry/routeGeometry';
import type { Route } from '../types/route';
import type { Runner } from '../types/runner';

const points = buildRoutePoints([
  { lat: -33.8688, lng: 151.2093 },
  { lat: -33.8683, lng: 151.2093 },
]);
const route: Route = {
  id: 'route-1',
  name: 'Test route',
  points,
  totalDistanceM: points[points.length - 1].cumulativeDistanceM,
};
const runner: Runner = {
  id: 'runner-1',
  name: 'Test runner',
  startTime: new Date('2026-08-20T08:00:00Z'),
  pace: { minPerKm: 5 },
  color: '#2563eb',
};

describe('useTimeline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useSimulationStore.setState({
      route,
      runner,
      clockTime: runner.startTime,
      isPlaying: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exposes the range bounds from the runner start time to the finish time', () => {
    const { result } = renderHook(() => useTimeline());
    expect(result.current.rangeStart.getTime()).toBe(runner.startTime.getTime());
    expect(result.current.rangeEnd.getTime()).toBeGreaterThan(runner.startTime.getTime());
  });

  it('scrub sets the store clock time directly', () => {
    const { result } = renderHook(() => useTimeline());
    const target = new Date(runner.startTime.getTime() + 60_000);

    act(() => {
      result.current.scrub(target);
    });

    expect(useSimulationStore.getState().clockTime?.getTime()).toBe(target.getTime());
  });

  it('play advances the clock over time and pause stops it', () => {
    const { result } = renderHook(() => useTimeline());

    act(() => {
      result.current.play();
    });
    expect(useSimulationStore.getState().isPlaying).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const afterOneTick = useSimulationStore.getState().clockTime?.getTime() ?? 0;
    expect(afterOneTick).toBeGreaterThan(runner.startTime.getTime());

    act(() => {
      result.current.pause();
    });
    expect(useSimulationStore.getState().isPlaying).toBe(false);

    const afterPause = useSimulationStore.getState().clockTime?.getTime();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(useSimulationStore.getState().clockTime?.getTime()).toBe(afterPause);
  });

  it('play restarts from the beginning once the clock has reached the end', () => {
    const { result } = renderHook(() => useTimeline());

    act(() => {
      result.current.scrub(result.current.rangeEnd);
    });
    expect(useSimulationStore.getState().clockTime?.getTime()).toBe(
      result.current.rangeEnd.getTime()
    );

    act(() => {
      result.current.play();
    });

    expect(useSimulationStore.getState().clockTime?.getTime()).toBe(
      result.current.rangeStart.getTime()
    );
    expect(useSimulationStore.getState().isPlaying).toBe(true);
  });
});
