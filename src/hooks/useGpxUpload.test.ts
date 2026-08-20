import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGpxUpload } from './useGpxUpload';
import { useSimulationStore } from '../store/simulationStore';
import cleanTrack from '../lib/gpx/fixtures/clean-track.gpx?raw';
import sparseRoute from '../lib/gpx/fixtures/sparse-route.gpx?raw';

function gpxFile(contents: string, name: string) {
  return new File([contents], name, { type: 'application/gpx+xml' });
}

describe('useGpxUpload', () => {
  beforeEach(() => {
    useSimulationStore.setState({ route: null, runner: null, clockTime: null, isPlaying: false });
  });

  it('stores the parsed route in the simulation store on a valid file', async () => {
    const { result } = renderHook(() => useGpxUpload());

    await act(async () => {
      await result.current.handleFile(gpxFile(cleanTrack, 'clean-track.gpx'));
    });

    await waitFor(() => {
      expect(useSimulationStore.getState().route?.name).toBe('Clean Test Track');
    });
    expect(result.current.error).toBeNull();
  });

  it('sets an error and does not store a route on an invalid file', async () => {
    const { result } = renderHook(() => useGpxUpload());

    await act(async () => {
      await result.current.handleFile(gpxFile(sparseRoute, 'sparse-route.gpx'));
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(useSimulationStore.getState().route).toBeNull();
  });
});
