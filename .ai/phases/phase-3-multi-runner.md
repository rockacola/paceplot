# Phase 3: multi-runner

**Status:** built (2026-08-21), verified in-browser during the build

## Mini plan

Multi-runner was on the original feature list since the very first idea capture (`waymarks/data/ideas/run-route-pace-simulator.md`), and was deferred out of both phase 1 (MVP) and phase 2 (UX polish). This phase builds it, plus two smaller items the user asked for alongside it: moving playback speed into the footer control bar as a dropdown, and adding a second predefined route.

### Feature list

1. **Multiple runners on one route**. Each with independent start time, pace, and color, all visualised together on the map at once, driven by the same shared clock/scrubber.
2. **User-editable runner color**. Previously fixed and decorative (phase 2 explicitly deferred this). Each runner gets its own color, changeable by the user.
3. **Up to 8 runners, as a tweakable constant**. `MAX_RUNNERS` (proposed value: 8) in config, not a magic number in a component.
4. **Collapsible runner cards (accordion-style)**, showing a summary when collapsed. For example, "Runner 1 starts 7:30 AM @ 5:00/km".
5. **Playback speed moves into the footer control bar**, next to Play/scrub, as a dropdown instead of a row of buttons. Saves horizontal space, matching the user's request to shrink its footprint.
6. **Second predefined route**: `TCS_Sydney_Marathon_2026_Course.gpx` from Downloads, renamed to match the existing kebab-case convention, added to the preset list alongside Whale Rock.

### In scope

- Everything in the feature list above.
- The data-model change from a single `runner` to a `runners` array/collection.
- A runner color palette sized independently of `MAX_RUNNERS`.

### Out of scope (stays on the roadmap, untouched by this phase)

- POI customisation (km markers, water stations, custom pins)
- Backend / save / share
- GPX/data export
- Road-snapping
- Per-runner named identity beyond "Runner N" (no renaming UI unless asked)

### Resolved decisions

- **Route asset**: copy `TCS_Sydney_Marathon_2026_Course.gpx` to `public/routes/tcs-sydney-marathon-2026-course.gpx`, matching `whale-rock-trail-race-17km.gpx`'s kebab-case pattern. Display label: **"TCS Sydney Marathon 2026"**. Worth flagging: the GPX's own embedded track name reads "TCS Sydney Marathon **2025** - 42.195 km" (last year's recorded course, reused as this year's route data). Going with "2026" for the display label since that's what the filename you gave it says and presumably what you're planning around. Say if you'd rather it read 2025 or something else.
- **`MAX_POINT_GAP_M` raised from 500m to 700m** (`lib/gpx/validateGpx.ts`, a phase 1 constant): the TCS file failed validation at 500m, checked it, and it's a genuine 650-point dense recorded track (~65m average spacing) with exactly 2 brief GPS dropouts (653m, 513m), not a sparse route-planner file, which is what that threshold exists to catch. Confirmed with the user before changing a shared, cross-cutting constant. Applies to every GPX (upload and preset), not just this one.
- **Shared clock, independent runners**. One global `clockTime`, play/pause, and scrub position drives every runner at once (this was already the plan in the phase 1 tech spec: "multi-runner orchestration is just N independent evaluations per tick"). No per-runner playback.
- **Timeline range spans all runners**. The scrubber's min and max become the earliest start time and the latest finish time across every runner in the store, instead of one runner's own start and finish. A runner outside the currently scrubbed time just doesn't render a marker, the same "before start, no marker" and "after finish, no marker" rules as today apply per-runner.
- **Color palette**: a fixed set of **12** preset colors, independent of `MAX_RUNNERS` (8). This always leaves unused colors even at full capacity. Editing color means picking one of the 12 swatches, not a full color picker. Manually picking is unrestricted, so you can knowingly pick a color another runner already has. "Add runner" auto-assigns the first color in the 12 not currently used by any active runner, so runners never default to a clash.
- **Color changes commit immediately**, with no Apply step, consistent with how Route selection and Playback speed already work today. It's a discrete pick, not a typed value with a draft state worth protecting.
- **One global Apply button, still outside the runner cards**. Generalising your phase 2 instruction, it sits below the whole runner list, above the Playback area. Clicking it commits every runner's pending start-time and pace edits at once, not one at a time. Flagged below as worth confirming, since per-runner Apply buttons are a legitimate alternative.
- **Accordion cards are independently collapsible**, not mutually exclusive. You can have two runners expanded at once to compare them side by side. All start expanded, both on first load and when a new runner is added.
- **Minimum of 1 runner**. The last remaining runner can't be removed. This mirrors phase 2's "always usable, defaults auto-applied" stance: there should always be at least one runner to plan around.
- **Summary label format**: `{name} starts {h:mm AM/PM} @ {m:ss}/km`, for example "Runner 1 starts 7:30 AM @ 5:00/km". Matches your example.

### Open questions

1. **Per-runner Apply vs. one global Apply**. Proposing one global Apply button below the runner list that commits all pending runner edits at once (see resolved decision above). If you'd rather each runner card have its own Apply so runners can be committed independently of each other, say so.
2. **Remove-runner control**. Not explicitly requested, but "up to 8" implies you'll also want to remove one once added. Proposing a small remove or delete action on each runner card, disabled when only 1 runner remains. Confirm this should be built now rather than left for later.
3. **`MAX_RUNNERS` value**. Proposing 8 as given. The color palette is sized separately at 12, per your latest note.
4. **Playback speed dropdown default**. Still x20, unchanged from phase 2, just relocated and restyled. Confirm that's still right.

## Tech spec

Proceeding with all four open questions resolved as proposed: one global Apply button, a remove-runner control built now, `MAX_RUNNERS` = 8, and x20 as the playback speed dropdown's default. None were overridden.

### Data model changes

- `Runner` (type) is unchanged in shape: `id`, `name`, `startTime`, `pace`, `color`.
- `SimulationState` (store): `runner: Runner | null` becomes `runners: Runner[]`. `route`, `clockTime`, `isPlaying`, and `playbackSpeed` stay singular and global, since one clock drives every runner.
  - `setRunner` is replaced by three actions: `addRunner(runner)`, `updateRunner(runner)` (upsert by id, same shape `setRunner` had), and `removeRunner(id)`.

### New config

- `runnerDefaults.ts` gains `MAX_RUNNERS` (8) and `RUNNER_COLOR_PALETTE`, a fixed list of 12 hex colors (Tailwind's 600-weight blue, red, green, amber, purple, pink, teal, orange, indigo, lime, cyan, and fuchsia: evenly spread hues at matching lightness and chroma, so every runner reads clearly against the map and against each other). `DEFAULT_RUNNER_COLOR` becomes an alias for `RUNNER_COLOR_PALETTE[0]`, kept for `MapView`'s existing fallback prop default. `DEFAULT_START_TIME`, `DEFAULT_PACE_MIN`, and `DEFAULT_PACE_SEC` are unchanged and apply to every newly added runner, not just the first.

### Algorithms

- **Timeline range across runners** (`lib/simulation/timelineRange.ts`, new, pure): `rangeStart` is the earliest `startTime` across all runners; `rangeEnd` is the latest per-runner finish time (`startTime + route.totalDistanceM / paceToSpeedMps(pace.minPerKm)`), computed per runner since each can have a different pace. Zero runners or no route falls back to today's existing single-point behavior (`rangeStart === rangeEnd`).
- **Runner positions** (`lib/simulation/getRunnersPositions.ts`, new, pure): maps `runners` through the existing (unchanged) `getRunnerPosition(route, runner, clockTime)`, pairing each with its `id` and `color`, dropping any that return `null` (not yet started, or already finished). `MapView` renders exactly this list, one marker per entry.
- **Clock resync on any committed-runner change**: generalises the phase 2 fix (`clockTime` is an absolute `Date`; a stale clock left behind by a start-time change makes `getRunnerPosition` compute negative elapsed time and hide the marker). The rule going forward: whenever the _committed_ runner set changes for any reason, adding one, removing one, or applying pending edits, `clockTime` resets to the new aggregate `rangeStart` and playback stops. Resetting to `rangeStart` (rather than to any single runner's start) is correct even with staggered starts: a runner whose start time is later than the reset point legitimately shows no marker yet, that's accurate simulation, not the phase 2 bug.
- **Summary label** (`lib/format/formatRunnerSummary.ts`, new, pure): `{name} starts {h:mm AM/PM} @ {m:ss}/km` from a committed `Runner`, e.g. "Runner 1 starts 7:30 AM @ 5:00/km". Formats off the committed runner, never the draft fields, so a collapsed card's summary only changes once Apply is clicked.
- **Auto color assignment**: "Add runner" picks the first entry in `RUNNER_COLOR_PALETTE` not currently used by any runner in the store. With 12 colors and 8 max runners, this can never fail to find one.

### Module breakdown

- `config/runnerDefaults.ts`: `MAX_RUNNERS`, `RUNNER_COLOR_PALETTE`, `DEFAULT_RUNNER_COLOR`, existing pace/time defaults.
- `lib/simulation/timelineRange.ts`: pure range calculation, used by `useTimeline`.
- `lib/simulation/getRunnersPositions.ts`: pure per-tick position list, used by `App`.
- `lib/format/formatRunnerSummary.ts`: pure summary-string formatter, used by `RunnerCard`.
- `store/simulationStore.ts`: `runners` array plus `addRunner` / `updateRunner` / `removeRunner`.
- `hooks/useRunnersForm.ts` (replaces `useRunnerForm.ts`): owns per-runner draft field state, add/remove, per-runner and aggregate `hasPendingChanges`, `applyAll()`, and immediate-commit color changes. Detailed below under Solution design.
- `hooks/useTimeline.ts`: unchanged responsibility, just reads `runners` (plural) and delegates range math to `timelineRange.ts`.

## Solution design

### New files

- `src/config/runnerDefaults.ts` (changed, not new): + `MAX_RUNNERS`, `RUNNER_COLOR_PALETTE`
- `src/lib/simulation/timelineRange.ts` (+ test)
- `src/lib/simulation/getRunnersPositions.ts` (+ test)
- `src/lib/format/formatRunnerSummary.ts` (+ test)
- `src/hooks/useRunnersForm.ts` (+ test), replaces `useRunnerForm.ts`
- `src/components/ColorSwatchPicker.tsx` (+ test): presentational, 12 clickable swatches, highlights the selected one
- `src/components/RunnerCard.tsx` (+ test): one accordion item, composes the color picker + (renamed-in-place) `RunnerControls` fields + collapse chrome + a remove button
- `src/components/RunnerList.tsx` (+ test): renders `RunnerCard`s from `useRunnersForm()`, plus the "Add runner" button (disabled at `MAX_RUNNERS`)
- `public/routes/tcs-sydney-marathon-2026-course.gpx`: copied from the Downloads source

### Changed files

- `src/store/simulationStore.ts`: `runners: Runner[]`, `addRunner` / `updateRunner` / `removeRunner`
- `src/hooks/useTimeline.ts`: reads `runners`, delegates range math to `timelineRange.ts`
- `src/components/Timeline.tsx`: `isReady` becomes `Boolean(route && runners.length > 0)`; gains `<PlaybackSpeedControl />` inline in its control row
- `src/components/PlaybackSpeedControl.tsx`: rewritten from a button group to a `<select>` dropdown; same store wiring (`playbackSpeed` / `setPlaybackSpeed`)
- `src/components/RunnerControls.tsx`: unchanged responsibility (presentational start-time + pace fields), now composed inside `RunnerCard` instead of consumed directly by `App`
- `src/components/RunnerApplyButton.tsx`: unchanged component; now wired to `useRunnersForm()`'s aggregate `hasPendingChanges` and `applyAll`
- `src/components/MapView.tsx`: `runnerPosition` / `runnerColor` props replaced by a single `runnerMarkers: { id, lat, lng, color }[]` prop; renders one dot marker per entry
- `src/config/predefinedRoutes.ts`: add the TCS Sydney Marathon entry
- `src/App.tsx`: `useRunnersForm()` instead of `useRunnerForm()`; sidebar's "Runner" section becomes "Runners" wrapping `RunnerList`; the standalone "Playback" section is removed (moved into `Timeline`); `runnerMarkers` computed via `getRunnersPositions` and passed to `MapView`

### Key types

```ts
type RunnerDraft = {
  timeValue: string;
  paceMinValue: string;
  paceSecValue: string;
};

type RunnerFormEntry = {
  id: string;
  color: string;
  summary: string; // from the committed runner
  timeValue: string;
  setTimeValue: (v: string) => void;
  paceMinValue: string;
  setPaceMinValue: (v: string) => void;
  paceSecValue: string;
  setPaceSecValue: (v: string) => void;
  setColor: (hex: string) => void; // commits immediately, no Apply
  hasPendingChanges: boolean;
};
```

### `useRunnersForm` design

Owns a `Record<runnerId, RunnerDraft>` of local, uncommitted field state, one entry per runner in the store, kept in sync as runners are added or removed. Exposes:

- `entries: RunnerFormEntry[]`, one per current runner, in store order
- `addRunner()`: builds a new `Runner` (next `Runner N` name, default start/pace, next unused palette color), commits it via the store's `addRunner`, seeds a matching draft entry (so it starts with no pending changes, same "usable without pressing Apply first" stance as phase 2), and resyncs the clock per the rule above
- `removeRunner(id)`: store's `removeRunner`, drops the draft entry, resyncs the clock; no-ops if only 1 runner remains
- `canAddRunner`: `runners.length < MAX_RUNNERS`
- `canRemoveRunner`: `runners.length > 1`
- `hasPendingChanges`: true if any entry's draft, parsed the same way `apply()` parses today, differs from its committed runner
- `applyAll()`: for every entry with a valid and dirty draft, commits the parsed start time and pace via `updateRunner`; afterward resyncs the clock to the new aggregate `rangeStart` and stops playback, same as a single add/remove

This is the same shape `useRunnerForm` used in phase 2 (parse, compare against committed, expose setters and an apply function), generalised from one runner to a keyed map of them, with the phase 2 clock-resync fix generalised to "resync on any committed-runner-set change" rather than "resync inside apply."

### Component contracts

- `RunnerCard`: presentational, given one `RunnerFormEntry` plus `onRemove` and `canRemove`. Owns its own `isExpanded` boolean as local UI state only (not lifted, not persisted). Collapsed view renders the color swatch and `summary`. Expanded view adds `ColorSwatchPicker` and the existing `RunnerControls` fields.
- `ColorSwatchPicker`: presentational, `colors: string[]`, `selected: string`, `onSelect: (hex) => void`. No hook needed.
- `RunnerList`: thin composition, maps `useRunnersForm().entries` to `RunnerCard`s, renders "Add runner" using `addRunner` / `canAddRunner`.
- `MapView`: still purely presentational; `runnerMarkers` replaces the single-marker props, one `divIcon` per entry.

### Implementation order

1. Config: `MAX_RUNNERS`, `RUNNER_COLOR_PALETTE` (no behavior change yet)
2. Pure lib functions first, tests first: `timelineRange.ts`, `getRunnersPositions.ts`, `formatRunnerSummary.ts`
3. Store: `runners` array, `addRunner` / `updateRunner` / `removeRunner` (tests first)
4. `useTimeline`: switch to `runners` + `timelineRange.ts` (tests first)
5. `useRunnersForm`: the core multi-runner orchestration hook (tests first, this is the biggest single piece)
6. `ColorSwatchPicker`, `RunnerCard`, `RunnerList` (tests first), composing `RunnerControls` (unchanged) inside `RunnerCard`
7. `PlaybackSpeedControl` rewritten as a dropdown (tests first); moved into `Timeline`
8. `MapView`: multi-marker rendering (tests first)
9. Predefined route: copy the GPX asset, add to `predefinedRoutes.ts`
10. `App.tsx` wiring: sidebar sectioning, `RunnerApplyButton` placement, `runnerMarkers` derivation
11. Full `npm run check` + `npm run test` + `npm run build` + `npm run build-storybook`, then a manual walkthrough

## Outcome

Built 2026-08-21, all 6 features implemented as specced, all four open questions kept as proposed (one global Apply, remove-runner built now, `MAX_RUNNERS` = 8, x20 default speed).

New: `lib/simulation/{timelineRange,getRunnersPositions}.ts`, `lib/format/formatRunnerSummary.ts`, `hooks/useRunnersForm.ts` (replaces `useRunnerForm.ts`), `components/{ColorSwatchPicker,RunnerCard,RunnerList}.tsx`, `public/routes/tcs-sydney-marathon-2026-course.gpx`. Changed: `store/simulationStore.ts` (`runners[]`, `addRunner`/`updateRunner`/`removeRunner`), `hooks/useTimeline.ts` (range across all runners), `components/{Timeline,RunnerControls,MapView}.tsx` (multi-runner aware), `PlaybackSpeedControl` (button row → dropdown, moved into `Timeline`), `App.tsx`, `config/{runnerDefaults,predefinedRoutes}.ts`.

13 new/rewritten test files, 103 tests total, all passing. `npm run check`, `npm run test`, `npm run build`, and `npm run build-storybook` all green.

**One bug caught and fixed during implementation, before it shipped**: `addRunner`/`removeRunner` read `runners.length` from the hook's render-closure instead of live store state, so several rapid calls batched into one React update (e.g. a fast test loop) could bypass the `MAX_RUNNERS` cap. Fixed by reading `useSimulationStore.getState().runners` inside those guards instead, mirroring how `resyncClock` already reads live state. Caught by a test that calls `addRunner()` `MAX_RUNNERS + 2` times in one `act()`.

**One layout bug caught during the in-browser walkthrough**: the collapsed runner-card summary ("Runner 1 starts 7:30 AM @ 6:00/km") was being cut off mid-word by a `truncate` class in a too-narrow flex row. Fixed by letting it wrap onto two lines instead (`min-w-0 flex-1`, no `truncate`).

**One data/validation issue caught during the in-browser walkthrough**: the TCS Sydney Marathon GPX failed the phase 1 `MAX_POINT_GAP_M` (500m) validation rule. Checked it: a genuine 650-point dense recorded track with 2 brief GPS dropouts (653m, 513m), not the sparse route-planner case that rule exists to catch. Raised the shared constant to 700m with the user's confirmation (it's cross-cutting, affects every GPX, not just this one).

Manually verified in-browser: route loading (both presets), multi-runner add/remove/color/pace/apply, and playback with two runners at different paces visibly diverging along the route. Real-time playback pacing itself wasn't reliably checkable through the browser automation tooling (background-tab timer throttling skewed it), but the tick math is unchanged from phase 2 and covered by `useTimeline.test.ts`.

**Follow-up fix, same day**: user reported x80 playback feeling laggy. Root cause: generalizing `useTimeline`'s range calc for multi-runner dropped the `useMemo` phase 2 had around it, so `getTimelineRange()` returned new `Date` objects every render, and since `setClockTime` fires every tick, that's every render. The tick-owning `useEffect` depends on those `Date`s by reference, so instead of one stable `setInterval`, it was tearing down and recreating the interval on every tick, at every speed, not just x80. Fixed by restoring the memoization (`useMemo` keyed on `route`/`runners`, stable across clockTime-only re-renders). Also added the complementary optimization the user proposed: render rate now scales down with playback speed (`TICK_FPS_BY_SPEED` in `simulationConfig.ts`, a tunable per-speed table: 30fps at x10 down to 12fps at x80), since a bigger per-tick time jump at high speed doesn't need the same render rate to look equally smooth. Regression test added asserting `setInterval`/`clearInterval` aren't called again mid-playback. 106 tests passing.
