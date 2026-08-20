import { create } from 'zustand';
import type { Route } from '../types/route';
import type { Runner } from '../types/runner';
import { type PlaybackSpeed, DEFAULT_PLAYBACK_SPEED } from '../config/simulationConfig';

type SimulationState = {
  route: Route | null;
  runner: Runner | null;
  clockTime: Date | null;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  setRoute: (route: Route | null) => void;
  setRunner: (runner: Runner | null) => void;
  setClockTime: (clockTime: Date) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (playbackSpeed: PlaybackSpeed) => void;
};

export const useSimulationStore = create<SimulationState>((set) => ({
  route: null,
  runner: null,
  clockTime: null,
  isPlaying: false,
  playbackSpeed: DEFAULT_PLAYBACK_SPEED,
  setRoute: (route) => set({ route }),
  setRunner: (runner) => set({ runner }),
  setClockTime: (clockTime) => set({ clockTime }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
}));
