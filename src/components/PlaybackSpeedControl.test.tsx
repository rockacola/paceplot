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

  it('shows the current speed selected in the dropdown', () => {
    render(<PlaybackSpeedControl />);
    expect(screen.getByLabelText(/playback speed/i)).toHaveValue(String(DEFAULT_PLAYBACK_SPEED));
  });

  it('updates the store when a different speed is chosen', async () => {
    render(<PlaybackSpeedControl />);
    await userEvent.selectOptions(screen.getByLabelText(/playback speed/i), 'x120');
    expect(useSimulationStore.getState().playbackSpeed).toBe(120);
  });
});
