import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaybackSpeedControl } from './PlaybackSpeedControl';
import { useSimulationStore } from '../store/simulationStore';
import { DEFAULT_PLAYBACK_SPEED } from '../config/simulationConfig';

describe('PlaybackSpeedControl', () => {
  beforeEach(() => {
    useSimulationStore.setState({ playbackSpeed: DEFAULT_PLAYBACK_SPEED });
  });

  it('marks the default speed as pressed', () => {
    render(<PlaybackSpeedControl />);
    expect(screen.getByRole('button', { name: `x${DEFAULT_PLAYBACK_SPEED}` })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('updates the store when a different speed is clicked', async () => {
    render(<PlaybackSpeedControl />);
    await userEvent.click(screen.getByRole('button', { name: 'x40' }));
    expect(useSimulationStore.getState().playbackSpeed).toBe(40);
  });
});
