import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Timeline } from './Timeline';
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

describe('Timeline', () => {
  beforeEach(() => {
    useSimulationStore.setState({
      route,
      runner,
      clockTime: runner.startTime,
      isPlaying: false,
    });
  });

  it('renders a scrubber and a play button when a runner exists', () => {
    render(<Timeline />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  it('toggles to a pause button once playing', async () => {
    render(<Timeline />);
    await userEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('renders a disabled scrubber and play button without a runner, instead of unmounting', () => {
    useSimulationStore.setState({ route, runner: null, clockTime: null, isPlaying: false });
    render(<Timeline />);
    expect(screen.getByRole('slider')).toBeDisabled();
    expect(screen.getByRole('button', { name: /play/i })).toBeDisabled();
  });

  it('enables the controls once a route and runner both exist', () => {
    render(<Timeline />);
    expect(screen.getByRole('slider')).toBeEnabled();
    expect(screen.getByRole('button', { name: /play/i })).toBeEnabled();
  });
});
