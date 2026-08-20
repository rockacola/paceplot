import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRunnerForm } from './useRunnerForm';
import { useSimulationStore } from '../store/simulationStore';
import { DEFAULT_RUNNER_COLOR } from '../config/runnerDefaults';
import { getRunnerPosition } from '../lib/simulation/position';
import { buildRoutePoints } from '../lib/geometry/routeGeometry';
import type { Route } from '../types/route';

describe('useRunnerForm', () => {
  beforeEach(() => {
    useSimulationStore.setState({ route: null, runner: null, clockTime: null, isPlaying: false });
  });

  it('commits the default start time, pace, and color to the store on mount', () => {
    const { result } = renderHook(() => useRunnerForm());

    const runner = useSimulationStore.getState().runner;
    expect(runner).not.toBeNull();
    expect(runner?.startTime.getHours()).toBe(7);
    expect(runner?.startTime.getMinutes()).toBe(30);
    expect(runner?.pace.minPerKm).toBe(6);
    expect(runner?.color).toBe(DEFAULT_RUNNER_COLOR);
    // nothing pending right after the defaults were just committed
    expect(result.current.hasPendingChanges).toBe(false);
  });

  it('has pending changes once a field diverges from the committed runner, and none once applied', () => {
    const { result } = renderHook(() => useRunnerForm());
    expect(result.current.hasPendingChanges).toBe(false);

    act(() => {
      result.current.setPaceMinValue('5');
    });
    expect(result.current.hasPendingChanges).toBe(true);

    act(() => {
      result.current.apply();
    });
    expect(result.current.hasPendingChanges).toBe(false);
  });

  it('has no pending changes when a field is edited back to the currently applied value', () => {
    const { result } = renderHook(() => useRunnerForm());

    act(() => {
      result.current.setPaceMinValue('5');
    });
    expect(result.current.hasPendingChanges).toBe(true);

    act(() => {
      result.current.setPaceMinValue('6');
    });
    expect(result.current.hasPendingChanges).toBe(false);
  });

  it('does not update the store while the fields are edited, only on apply', () => {
    const { result } = renderHook(() => useRunnerForm());
    const initialRunner = useSimulationStore.getState().runner;

    act(() => {
      result.current.setPaceMinValue('5');
    });
    expect(useSimulationStore.getState().runner).toBe(initialRunner);

    act(() => {
      result.current.apply();
    });
    expect(useSimulationStore.getState().runner?.pace.minPerKm).toBe(5);
    expect(useSimulationStore.getState().runner).not.toBe(initialRunner);
  });

  it('combines minutes and seconds fields into a single minPerKm value on apply', () => {
    const { result } = renderHook(() => useRunnerForm());

    act(() => {
      result.current.setPaceMinValue('5');
    });
    act(() => {
      result.current.setPaceSecValue('30');
    });
    act(() => {
      result.current.apply();
    });

    expect(useSimulationStore.getState().runner?.pace.minPerKm).toBe(5.5);
  });

  it('keeps the existing runner id and color across an apply', () => {
    const { result } = renderHook(() => useRunnerForm());
    const idAfterMount = useSimulationStore.getState().runner?.id;

    act(() => {
      result.current.setTimeValue('08:00');
    });
    act(() => {
      result.current.apply();
    });

    expect(useSimulationStore.getState().runner?.id).toBe(idAfterMount);
    expect(useSimulationStore.getState().runner?.startTime.getHours()).toBe(8);
  });

  it('resets the clock to the new start time on apply, so the marker does not go stale', () => {
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
    const { result } = renderHook(() => useRunnerForm());

    // Simulate playback having advanced the clock well past the original start time.
    act(() => {
      useSimulationStore.getState().setClockTime(new Date('2100-01-01T00:00:00Z'));
      useSimulationStore.getState().setIsPlaying(true);
    });

    act(() => {
      result.current.setTimeValue('09:00');
    });
    act(() => {
      result.current.apply();
    });

    const { runner, clockTime, isPlaying } = useSimulationStore.getState();
    expect(clockTime?.getTime()).toBe(runner?.startTime.getTime());
    expect(isPlaying).toBe(false);
    // and the marker is valid again (at the start point), not stuck "not started yet"
    expect(getRunnerPosition(route, runner!, clockTime!)).not.toBeNull();
  });
});
