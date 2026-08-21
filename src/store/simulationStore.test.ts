import { beforeEach, describe, expect, it } from 'vitest';
import { useSimulationStore } from './simulationStore';
import { buildRoutePoints } from '../lib/geometry/routeGeometry';
import { DEFAULT_PLAYBACK_SPEED } from '../config/simulationConfig';
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

function makeRunner(overrides: Partial<Runner> = {}): Runner {
  return {
    id: 'runner-1',
    name: 'Test runner',
    startTime: new Date('2026-08-20T08:00:00Z'),
    pace: { minPerKm: 5 },
    color: '#2563eb',
    ...overrides,
  };
}

describe('useSimulationStore', () => {
  beforeEach(() => {
    useSimulationStore.setState({
      route: null,
      runners: [],
      clockTime: null,
      isPlaying: false,
    });
  });

  it('starts with an empty state', () => {
    const state = useSimulationStore.getState();
    expect(state.route).toBeNull();
    expect(state.runners).toEqual([]);
    expect(state.clockTime).toBeNull();
    expect(state.isPlaying).toBe(false);
    expect(state.playbackSpeed).toBe(DEFAULT_PLAYBACK_SPEED);
  });

  it('setRoute stores the route', () => {
    useSimulationStore.getState().setRoute(route);
    expect(useSimulationStore.getState().route).toBe(route);
  });

  it('addRunner appends a runner', () => {
    const runner = makeRunner();
    useSimulationStore.getState().addRunner(runner);
    expect(useSimulationStore.getState().runners).toEqual([runner]);

    const second = makeRunner({ id: 'runner-2' });
    useSimulationStore.getState().addRunner(second);
    expect(useSimulationStore.getState().runners).toEqual([runner, second]);
  });

  it('updateRunner replaces the runner with the matching id, leaving others untouched', () => {
    const first = makeRunner({ id: 'runner-1' });
    const second = makeRunner({ id: 'runner-2' });
    useSimulationStore.setState({ runners: [first, second] });

    const updatedFirst = { ...first, pace: { minPerKm: 4 } };
    useSimulationStore.getState().updateRunner(updatedFirst);

    expect(useSimulationStore.getState().runners).toEqual([updatedFirst, second]);
  });

  it('removeRunner drops the runner with the matching id', () => {
    const first = makeRunner({ id: 'runner-1' });
    const second = makeRunner({ id: 'runner-2' });
    useSimulationStore.setState({ runners: [first, second] });

    useSimulationStore.getState().removeRunner('runner-1');

    expect(useSimulationStore.getState().runners).toEqual([second]);
  });

  it('setClockTime stores the clock time', () => {
    const t = new Date('2026-08-20T08:05:00Z');
    useSimulationStore.getState().setClockTime(t);
    expect(useSimulationStore.getState().clockTime).toBe(t);
  });

  it('setIsPlaying toggles play state', () => {
    useSimulationStore.getState().setIsPlaying(true);
    expect(useSimulationStore.getState().isPlaying).toBe(true);
    useSimulationStore.getState().setIsPlaying(false);
    expect(useSimulationStore.getState().isPlaying).toBe(false);
  });

  it('setPlaybackSpeed stores the playback speed', () => {
    useSimulationStore.getState().setPlaybackSpeed(120);
    expect(useSimulationStore.getState().playbackSpeed).toBe(120);
  });
});
