import { create } from 'zustand';
import type { Route } from '../types/route';
import type { Runner } from '../types/runner';
import { type PlaybackSpeed, DEFAULT_PLAYBACK_SPEED } from '../config/simulationConfig';

type SimulationState = {
  route: Route | null;
  runners: Runner[];
  clockTime: Date | null;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  setRoute: (route: Route | null) => void;
  addRunner: (runner: Runner) => void;
  updateRunner: (runner: Runner) => void;
  removeRunner: (id: string) => void;
  setClockTime: (clockTime: Date) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (playbackSpeed: PlaybackSpeed) => void;
};

export const useSimulationStore = create<SimulationState>((set) => ({
  route: null,
  runners: [],
  clockTime: null,
  isPlaying: false,
  playbackSpeed: DEFAULT_PLAYBACK_SPEED,
  setRoute: (route) => set({ route }),
  addRunner: (runner) => set((state) => ({ runners: [...state.runners, runner] })),
  updateRunner: (runner) =>
    set((state) => ({
      runners: state.runners.map((r) => (r.id === runner.id ? runner : r)),
    })),
  removeRunner: (id) => set((state) => ({ runners: state.runners.filter((r) => r.id !== id) })),
  setClockTime: (clockTime) => set({ clockTime }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
}));
