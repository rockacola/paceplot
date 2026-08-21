import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRunnersForm } from './useRunnersForm';
import { useSimulationStore } from '../store/simulationStore';
import { MAX_RUNNERS, RUNNER_COLOR_PALETTE } from '../config/runnerDefaults';
import { buildRoutePoints } from '../lib/geometry/routeGeometry';
import type { Route } from '../types/route';

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

describe('useRunnersForm', () => {
  beforeEach(() => {
    useSimulationStore.setState({
      route: null,
      runners: [],
      clockTime: null,
      isPlaying: false,
    });
  });

  it('seeds exactly one default runner on mount, with no pending changes', () => {
    const { result } = renderHook(() => useRunnersForm());

    const runners = useSimulationStore.getState().runners;
    expect(runners).toHaveLength(1);
    expect(runners[0].name).toBe('Runner 1');
    expect(runners[0].startTime.getHours()).toBe(7);
    expect(runners[0].startTime.getMinutes()).toBe(30);
    expect(runners[0].pace.minPerKm).toBe(6);
    expect(runners[0].color).toBe(RUNNER_COLOR_PALETTE[0]);
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].hasPendingChanges).toBe(false);
    expect(result.current.hasPendingChanges).toBe(false);
  });

  it('does not touch the store while a field is edited, only on applyAll', () => {
    const { result } = renderHook(() => useRunnersForm());
    const runnerId = result.current.entries[0].id;
    const before = useSimulationStore.getState().runners[0];

    act(() => {
      result.current.entries[0].setPaceMinValue('5');
    });
    expect(useSimulationStore.getState().runners[0]).toBe(before);
    expect(result.current.entries[0].hasPendingChanges).toBe(true);
    expect(result.current.hasPendingChanges).toBe(true);

    act(() => {
      result.current.applyAll();
    });
    const after = useSimulationStore.getState().runners.find((r) => r.id === runnerId);
    expect(after?.pace.minPerKm).toBe(5);
    expect(result.current.hasPendingChanges).toBe(false);
  });

  it('addRunner creates a new runner with the next unused palette color and an incrementing name', () => {
    const { result } = renderHook(() => useRunnersForm());

    act(() => {
      result.current.addRunner();
    });

    const runners = useSimulationStore.getState().runners;
    expect(runners).toHaveLength(2);
    expect(runners[1].name).toBe('Runner 2');
    expect(runners[1].color).toBe(RUNNER_COLOR_PALETTE[1]);
    expect(result.current.entries[1].hasPendingChanges).toBe(false);
  });

  it('disables adding once MAX_RUNNERS is reached, and addRunner past that is a no-op', () => {
    const { result } = renderHook(() => useRunnersForm());

    act(() => {
      for (let i = 0; i < MAX_RUNNERS + 2; i++) {
        result.current.addRunner();
      }
    });

    expect(useSimulationStore.getState().runners).toHaveLength(MAX_RUNNERS);
    expect(result.current.canAddRunner).toBe(false);
  });

  it('removeRunner drops a runner, but never the last one', () => {
    const { result } = renderHook(() => useRunnersForm());
    act(() => {
      result.current.addRunner();
    });
    const [first, second] = useSimulationStore.getState().runners;
    expect(result.current.canRemoveRunner).toBe(true);

    act(() => {
      result.current.removeRunner(first.id);
    });
    expect(useSimulationStore.getState().runners).toEqual([second]);
    expect(result.current.canRemoveRunner).toBe(false);

    act(() => {
      result.current.removeRunner(second.id);
    });
    expect(useSimulationStore.getState().runners).toEqual([second]);
  });

  it('setColor on an entry commits immediately, with no applyAll needed', () => {
    const { result } = renderHook(() => useRunnersForm());
    const runnerId = result.current.entries[0].id;

    act(() => {
      result.current.entries[0].setColor(RUNNER_COLOR_PALETTE[3]);
    });

    expect(useSimulationStore.getState().runners.find((r) => r.id === runnerId)?.color).toBe(
      RUNNER_COLOR_PALETTE[3]
    );
    expect(result.current.hasPendingChanges).toBe(false);
  });

  it('applyAll commits every dirty runner at once', () => {
    const { result } = renderHook(() => useRunnersForm());
    act(() => {
      result.current.addRunner();
    });

    act(() => {
      result.current.entries[0].setPaceMinValue('4');
    });
    act(() => {
      result.current.entries[1].setPaceMinValue('9');
    });
    expect(result.current.hasPendingChanges).toBe(true);

    act(() => {
      result.current.applyAll();
    });

    const runners = useSimulationStore.getState().runners;
    expect(runners[0].pace.minPerKm).toBe(4);
    expect(runners[1].pace.minPerKm).toBe(9);
    expect(result.current.hasPendingChanges).toBe(false);
  });

  it('resyncs the shared clock to the new earliest start and stops playback whenever the committed runner set changes', () => {
    useSimulationStore.setState({ route });
    const { result } = renderHook(() => useRunnersForm());

    act(() => {
      useSimulationStore.getState().setClockTime(new Date('2100-01-01T00:00:00Z'));
      useSimulationStore.getState().setIsPlaying(true);
    });

    act(() => {
      result.current.applyAll(); // nothing dirty, but resync still runs consistently
    });

    const runner = useSimulationStore.getState().runners[0];
    expect(useSimulationStore.getState().clockTime?.getTime()).toBe(runner.startTime.getTime());
    expect(useSimulationStore.getState().isPlaying).toBe(false);
  });

  it('formats each entry summary from the committed runner, not the draft', () => {
    const { result } = renderHook(() => useRunnersForm());

    expect(result.current.entries[0].summary).toBe('Runner 1 starts 7:30 AM @ 6:00/km');

    act(() => {
      result.current.entries[0].setPaceMinValue('4');
    });
    expect(result.current.entries[0].summary).toBe('Runner 1 starts 7:30 AM @ 6:00/km');

    act(() => {
      result.current.applyAll();
    });
    expect(result.current.entries[0].summary).toBe('Runner 1 starts 7:30 AM @ 4:00/km');
  });
});
