export const SIMULATION_FPS = 30;
export const TICK_INTERVAL_MS = Math.round(1000 / SIMULATION_FPS);

export const PLAYBACK_SPEED_OPTIONS = [10, 20, 40, 80] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEED_OPTIONS)[number];
export const DEFAULT_PLAYBACK_SPEED: PlaybackSpeed = 20;
