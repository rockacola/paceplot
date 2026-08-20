import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GpxUpload } from './GpxUpload';
import { useSimulationStore } from '../store/simulationStore';
import cleanTrack from '../lib/gpx/fixtures/clean-track.gpx?raw';
import sparseRoute from '../lib/gpx/fixtures/sparse-route.gpx?raw';

function gpxFile(contents: string, name: string) {
  return new File([contents], name, { type: 'application/gpx+xml' });
}

describe('GpxUpload', () => {
  beforeEach(() => {
    useSimulationStore.setState({ route: null, runner: null, clockTime: null, isPlaying: false });
  });

  it('shows a placeholder before any file is chosen', () => {
    render(<GpxUpload />);
    expect(screen.getByText('No file chosen')).toBeInTheDocument();
  });

  it('uploads a valid file, shows its name, and stores the route with no visible error', async () => {
    render(<GpxUpload />);
    const input = screen.getByLabelText(/gpx/i);
    await userEvent.upload(input, gpxFile(cleanTrack, 'clean-track.gpx'));

    expect(screen.getByText('clean-track.gpx')).toBeInTheDocument();
    expect(await screen.findByText(/clean test track/i)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a validation error for an invalid file', async () => {
    render(<GpxUpload />);
    const input = screen.getByLabelText(/gpx/i);
    await userEvent.upload(input, gpxFile(sparseRoute, 'sparse-route.gpx'));

    expect(await screen.findByRole('alert')).toHaveTextContent(/recorded track/i);
  });
});
