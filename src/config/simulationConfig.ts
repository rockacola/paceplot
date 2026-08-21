export const PLAYBACK_SPEED_OPTIONS = [30, 60, 120, 180] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEED_OPTIONS)[number];
export const DEFAULT_PLAYBACK_SPEED: PlaybackSpeed = 60;

// Each tick already advances the sim clock by TICK_INTERVAL_MS * playbackSpeed,
// so a higher multiplier means a bigger jump per frame regardless of render
// rate. There's no visual smoothness gained from rendering x180 at the same
// 30fps as x30, so redraw less often as speed increases to keep the app
// responsive. Tune these per-speed FPS values to trade smoothness for CPU.
export const TICK_FPS_BY_SPEED: Record<PlaybackSpeed, number> = {
  30: 30,
  60: 24,
  120: 18,
  180: 12,
};

export function getTickIntervalMs(speed: PlaybackSpeed): number {
  return Math.round(1000 / TICK_FPS_BY_SPEED[speed]);
}
