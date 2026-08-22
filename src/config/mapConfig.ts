// Km markers declutter at low zoom (a marathon route would drop ~8 markers
// at every 5km, more at tighter intervals), so they only render once the map
// is zoomed in past this level. Both values are plain constants for now;
// making them user-adjustable later just means swapping these reads for a
// store value, the marker math and zoom-gating already don't care where the
// numbers come from.
export const KM_MARKER_INTERVAL_KM = 5;
export const KM_MARKER_MIN_ZOOM = 13;
