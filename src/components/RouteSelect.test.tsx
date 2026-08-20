import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouteSelect } from './RouteSelect';
import { useSimulationStore } from '../store/simulationStore';
import { PREDEFINED_ROUTES } from '../config/predefinedRoutes';
import cleanTrack from '../lib/gpx/fixtures/clean-track.gpx?raw';

describe('RouteSelect', () => {
  beforeEach(() => {
    useSimulationStore.setState({ route: null, runner: null, clockTime: null, isPlaying: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists the predefined routes plus an upload option', () => {
    render(<RouteSelect />);
    const select = screen.getByLabelText(/route/i);
    expect(select).toHaveTextContent(PREDEFINED_ROUTES[0].name);
    expect(select).toHaveTextContent(/upload your own/i);
  });

  it('loads a predefined route into the store when selected', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ text: () => Promise.resolve(cleanTrack) }));
    render(<RouteSelect />);

    await userEvent.selectOptions(screen.getByLabelText(/route/i), PREDEFINED_ROUTES[0].id);

    expect(
      await screen.findByText(new RegExp(`loaded: ${PREDEFINED_ROUTES[0].name}`, 'i'))
    ).toBeInTheDocument();
  });

  it('reveals the file upload input when "Upload your own" is chosen', async () => {
    render(<RouteSelect />);
    await userEvent.selectOptions(screen.getByLabelText(/route/i), 'upload');
    expect(screen.getByLabelText(/gpx/i)).toBeInTheDocument();
  });
});
