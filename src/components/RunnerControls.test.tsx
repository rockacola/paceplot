import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RunnerControls } from './RunnerControls';
import { useSimulationStore } from '../store/simulationStore';

describe('RunnerControls', () => {
  beforeEach(() => {
    useSimulationStore.setState({ route: null, runner: null, clockTime: null, isPlaying: false });
  });

  it('writes a runner with start time and pace to the store', async () => {
    render(<RunnerControls />);

    await userEvent.type(screen.getByLabelText(/start time/i), '08:00');
    await userEvent.type(screen.getByLabelText(/pace/i), '5');

    const runner = useSimulationStore.getState().runner;
    expect(runner).not.toBeNull();
    expect(runner?.pace.minPerKm).toBe(5);
    expect(runner?.startTime.getHours()).toBe(8);
    expect(runner?.startTime.getMinutes()).toBe(0);
  });
});
