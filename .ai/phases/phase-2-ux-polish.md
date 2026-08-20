# Phase 2: UX polish

**Status:** planning

## Mini plan

Phase 1 proved the core loop end to end but the UI was built for correctness, not use. Phase 2 doesn't add new simulation capability (no multi-runner, no backend, no POIs), it makes the existing single-runner loop pleasant and clear to operate, plus two small scope additions the user asked for alongside the polish (a route preset list, a playback speed control).

### Feature list

1. **Timeline always visible** — the play/scrub bar currently unmounts (`Timeline` returns `null`) until a runner exists. It should always render; controls are disabled/inert (grayed out, non-interactive) until a route and runner both exist, rather than the whole bar disappearing.
2. **Clearer pace input** — today it's a single free-typed decimal (`6.5` reads as "6.5 min/km" but looks like it could mean 6:50). Replace with two small number fields, minutes and seconds, so the value is unambiguous.
3. **Typography and layout pass** — bigger text throughout, more breathing room in the sidebar, general design consideration. No specific spec beyond "bigger and considered"; judged during implementation against the rest of this doc's direction.
4. **Runner defaults + grouped input block** — default start time 7:30am, default pace 6:00/km (prefilled on load, not empty fields the user must fill before anything works). Start time and pace inputs grouped visually into one block, with a small color swatch to their left. This requires adding a `color` field to the `Runner` type (present in the phase 1 spec's original data model but never implemented).
5. **Circular marker instead of pin** — the map currently uses Leaflet's default teardrop pin icon for the runner. Replace with a plain dot/circle marker.
6. **Configurable animation frame rate** — the simulation tick currently runs at a hardcoded 250ms interval (4 updates/sec), which reads as choppy. Replace with a named, tweakable constant at a much higher rate.
7. **Route source: upload or preset dropdown** — currently upload-only. Add a dropdown offering predefined routes plus an "upload your own" option that reveals the existing file input. One preset ships in this phase: **"Whale Rock Trial Race 17km"**, sourced from `/Users/travis/Downloads/Whale Rock Trial Race 17km.gpx`, copied into the repo as a static asset.
8. **Configurable playback speed** — replace the hardcoded 60x multiplier with a user-facing 3-way control: x10 / x20 / x40 (meaning N simulated seconds elapse per 1 real second, same semantics the multiplier already has today).
9. **Replay from the beginning** — today, once playback reaches the end it stops with `clockTime` sitting at `rangeEnd`. Clicking Play again just re-triggers the same "reached the end" check on the next tick and pauses instantly, looking like a dead button. Play should detect `clockTime >= rangeEnd` and reset to `rangeStart` before starting.
10. **Version bump** — `package.json` version goes from `0.0.0` to `1.0.0`.
11. **Version number in the header** — page header reads "Paceplot (1.0.0)", the version number in a lighter grey and smaller font than "Paceplot".
12. **Disable playback controls when there isn't enough info to play** — explicit statement of the "Timeline disabled state" decision below: no route, or no runner, means Play/scrub are disabled, not just visually muted.
13. **Visual grouping by input type** — the sidebar today is one flat stack of label+input pairs. Organise it into distinct sections: a Route section (preset dropdown / upload), a Runner section (color swatch + start time + pace), a Playback section (speed selector), each visually set apart (heading + card/border), rather than everything reading as one undifferentiated list.
14. **Explicit "Apply" for runner changes** — start time and pace currently commit to the store (and the live simulation) on every keystroke. Edits to those two fields should stay local to the form until the user clicks a prominent "Apply" button; nothing about the runner in the simulation changes until then.

### In scope

- Everything in the feature list above, single runner only.
- Adding `color` to the `Runner` type (decorative swatch only, not a picker).
- One new static GPX asset + a small preset-routes list/config.
- New config constants for frame rate and playback speed options.

### Out of scope (stays on the waymarks roadmap, untouched by this phase)

- Multi-runner simulator
- POI customisation (km markers, water stations, custom pins)
- Backend / save / share
- GPX/data export
- Road-snapping
- Runner color picker / editable color (swatch is fixed for now, see open question below)

### Resolved decisions

- **Preset GPX file**: copied to `public/routes/whale-rock-trail-race-17km.gpx` (kebab-case filename; the source filename has spaces, which don't belong in a URL path). Display label stays exactly **"Whale Rock Trial Race 17km"** as given, filename doesn't need to match the label.
- **Route source UI**: single dropdown listing predefined routes plus a trailing "Upload your own GPX file…" entry; picking it reveals the current file input. Not two separate controls.
- **Pace input shape**: two adjacent number inputs (min, sec), not a single text field with mm:ss parsing. Fewer edge cases, no format-string ambiguity.
- **Frame rate**: new `src/config/simulation.ts` holding a `SIMULATION_FPS` constant (proposed default: 30, i.e. ~33ms tick, up from ~4fps today). The tick interval derives from this constant so it stays the single tweak point.
- **Playback speed options**: x10 / x20 / x40, replacing 60x. These live as a constant list alongside a default in `src/config/simulation.ts`.
- **Timeline disabled state**: bar renders always; play button and scrubber are disabled (not hidden) with the range collapsed to a single point until route + runner exist.
- **Replay on end**: `play()` resets `clockTime` to `rangeStart` when called while `clockTime` is at or past `rangeEnd`, then proceeds as normal.
- **Version display**: single source of truth stays `package.json`. Vite's `define` config reads the version at build time and injects it as a `__APP_VERSION__` global constant (standard Vite pattern), declared in `vite-env.d.ts`. No new dependency, no runtime fetch, no duplicated version string.
- **Sidebar sectioning**: three visually distinct groups — Route, Runner, Playback — each its own card/section with a heading, replacing the current flat stack.
- **Apply button scope**: applies to the Runner section only (start time + pace). Route selection (picking a preset or a file) and playback speed (clicking x10/x20/x40) are already discrete, single-action choices, not continuously-typed values, so they keep committing immediately, no separate Apply needed there.
- **Defaults still auto-apply on load**: the 7:30am / 6:00/km defaults commit to the store immediately on mount (so the app is usable without the user having to press Apply first). Apply only gates _subsequent_ edits to those fields.

### Open questions

1. **Playback speed default** — proposing **x20** (the middle option) as the default on load. Confirm or override.
2. **Runner color swatch** — proposing a single fixed decorative color (not user-editable) since this phase stays single-runner and no color picker was requested. Confirm that's fine for now, or say if it should be clickable/editable already.
3. **Frame rate number** — proposing 30fps as the default for `SIMULATION_FPS`. It's a single constant either way, so the number itself is low-stakes, but confirm 30 is a reasonable starting point rather than something higher (e.g. 60).

## Tech spec

(Fill in once the mini plan is settled: data model changes, algorithms, module breakdown, resolved decisions.)

## Solution design

(Fill in once the tech spec is settled: file layout, component contracts, implementation order.)
