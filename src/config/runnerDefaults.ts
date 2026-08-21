export const DEFAULT_START_TIME = '07:30';
export const DEFAULT_PACE_MIN = 6;
export const DEFAULT_PACE_SEC = 0;

export const MAX_RUNNERS = 8;

// Tailwind 600-weight swatches: evenly spread hues at matching lightness and
// chroma, so every runner reads clearly against the map and against each
// other. 12 colors leaves headroom over MAX_RUNNERS so there's always an
// unused one to auto-assign.
export const RUNNER_COLOR_PALETTE = [
  '#2563eb', // blue
  '#dc2626', // red
  '#16a34a', // green
  '#d97706', // amber
  '#9333ea', // purple
  '#db2777', // pink
  '#0d9488', // teal
  '#ea580c', // orange
  '#4f46e5', // indigo
  '#65a30d', // lime
  '#0891b2', // cyan
  '#c026d3', // fuchsia
] as const;

export const DEFAULT_RUNNER_COLOR = RUNNER_COLOR_PALETTE[0];
