import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UPLOAD_OPTION_VALUE, useRouteSelect } from './useRouteSelect';
import { useSimulationStore } from '../store/simulationStore';
import { PREDEFINED_ROUTES } from '../config/predefinedRoutes';
import cleanTrack from '../lib/gpx/fixtures/clean-track.gpx?raw';
import sparseRoute from '../lib/gpx/fixtures/sparse-route.gpx?raw';

describe('useRouteSelect', () => {
  beforeEach(() => {
    useSimulationStore.setState({ route: null, runners: [], clockTime: null, isPlaying: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches a predefined route and stores it under its configured display name', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ text: () => Promise.resolve(cleanTrack) }));
    const preset = PREDEFINED_ROUTES[0];
    const { result } = renderHook(() => useRouteSelect());

    await act(async () => {
      await result.current.handleSelect(preset.id);
    });

    await waitFor(() => {
      expect(useSimulationStore.getState().route?.name).toBe(preset.name);
    });
    expect(result.current.error).toBeNull();
  });

  it('sets an error and does not store a route when the preset fails validation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ text: () => Promise.resolve(sparseRoute) }));
    const preset = PREDEFINED_ROUTES[0];
    const { result } = renderHook(() => useRouteSelect());

    await act(async () => {
      await result.current.handleSelect(preset.id);
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(useSimulationStore.getState().route).toBeNull();
  });

  it('switches to upload mode without touching the store', async () => {
    const { result } = renderHook(() => useRouteSelect());

    await act(async () => {
      await result.current.handleSelect(UPLOAD_OPTION_VALUE);
    });

    expect(result.current.isUploadMode).toBe(true);
    expect(useSimulationStore.getState().route).toBeNull();
  });
});
