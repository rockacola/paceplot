import { create } from 'zustand';
import type { Route } from '../types/route';
import type { Runner } from '../types/runner';

type SimulationState = {
  route: Route | null;
  runner: Runner | null;
  clockTime: Date | null;
  isPlaying: boolean;
  setRoute: (route: Route | null) => void;
  setRunner: (runner: Runner | null) => void;
  setClockTime: (clockTime: Date) => void;
  setIsPlaying: (isPlaying: boolean) => void;
};

export const useSimulationStore = create<SimulationState>((set) => ({
  route: null,
  runner: null,
  clockTime: null,
  isPlaying: false,
  setRoute: (route) => set({ route }),
  setRunner: (runner) => set({ runner }),
  setClockTime: (clockTime) => set({ clockTime }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
}));
