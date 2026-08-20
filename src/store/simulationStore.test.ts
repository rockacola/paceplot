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
const runner: Runner = {
  id: 'runner-1',
  name: 'Test runner',
  startTime: new Date('2026-08-20T08:00:00Z'),
  pace: { minPerKm: 5 },
  color: '#2563eb',
};

describe('useSimulationStore', () => {
  beforeEach(() => {
    useSimulationStore.setState({
      route: null,
      runner: null,
      clockTime: null,
      isPlaying: false,
    });
  });

  it('starts with an empty state', () => {
    const state = useSimulationStore.getState();
    expect(state.route).toBeNull();
    expect(state.runner).toBeNull();
    expect(state.clockTime).toBeNull();
    expect(state.isPlaying).toBe(false);
    expect(state.playbackSpeed).toBe(DEFAULT_PLAYBACK_SPEED);
  });

  it('setRoute stores the route', () => {
    useSimulationStore.getState().setRoute(route);
    expect(useSimulationStore.getState().route).toBe(route);
  });

  it('setRunner stores the runner', () => {
    useSimulationStore.getState().setRunner(runner);
    expect(useSimulationStore.getState().runner).toBe(runner);
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
    useSimulationStore.getState().setPlaybackSpeed(40);
    expect(useSimulationStore.getState().playbackSpeed).toBe(40);
  });
});
