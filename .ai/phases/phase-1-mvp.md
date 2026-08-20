# Phase 1: MVP

**Status:** done (built 2026-08-20)

Moved here from the `waymarks` repo's idea capture (`data/ideas/run-route-pace-simulator.md`), where this was originally planned before the `paceplot` repo existed. That file now keeps only the original idea capture and any not-yet-scoped roadmap items; the detailed technical spec and solution design that were developed there now live here.

## Mini plan

**Core loop:** upload route, define runner (start time, pace), pick a clock time, see estimated position on the map.

**Feature list (as originally given):**

- Upload a running route onto a map
- Define a runner: start time, pace
- Visualise estimated position at a given time, assuming constant pace
- Toggle-able points of interest: km markers, water stations, custom POIs
- Multiple runners simultaneously, each with their own start time and pace, all visualised together

**MVP scope (finalized, narrower than the feature list above):**

- Upload a GPX file, validate on upload (reject sparse `<rte>`/no `<trk>`/too few points/large point-gaps with a clear error), parse into normalized geometry + cumulative distance
- Render the route polyline over a Leaflet/OSM map
- Single runner only: start time + constant pace
- Timeline scrubber / play-pause driving `distance_covered(t)` to position via Turf.js `along()`
- No km markers, no custom POIs, no backend, no export, no multi-runner, all explicitly deferred (see Roadmap in the waymarks idea doc)

## Tech spec

### Data model

- **Route**: id, name, geometry as an ordered list of `{lat, lng, cumulative_distance_m, elevation?}`, total distance, source metadata (file name, import date).
- **Runner**: id, name, route_id, start_time, pace (constant `min/km` for MVP; later a piecewise list of per-km or per-segment splits), display color/label.
- **POI**: id, route_id, type (`km_marker` | `water_station` | `custom`), position expressed as distance-along-route (preferred, so it's independent of exact lat/lng) or raw lat/lng, label. Not built in MVP, deferred to roadmap.

### Core algorithm: time to position on route

1. Precompute cumulative distance along the route polyline (Haversine, or projected distance between consecutive points).
2. Convert pace to speed (m/s). For constant pace this is a single value; for splits, build a piecewise speed function and precompute cumulative time-at-each-km-marker so lookups stay cheap.
3. `distance_covered(t) = speed * (t - start_time)`, clamped to `[0, total_distance]`.
4. Binary-search the cumulative distance array to find the bracketing route segment, then linearly interpolate lat/lng (and elevation, if present) within that segment.
5. This is a pure function of `(route, runner, clock_time)`, no server round-trip needed per frame, so animation/scrubbing runs entirely client-side once route + runner data are loaded.

### Component breakdown (tech-agnostic)

- **Map layer**: base map, route polyline rendering, runner markers, POI markers/toggles, timeline scrubber + play/pause controls.
- **Route importer**: parses GPX/TCX/KML (or accepts a drawn/manual route) into the normalized geometry + cumulative-distance format above.
- **Simulation engine**: the time to position function described above, plus multi-runner orchestration (just N independent evaluations per tick). Multi-runner not built in MVP.
- **Persistence**: routes, runner profiles, and POIs need to be saved somewhere. MVP is local-only (browser session, no accounts, no persistence between sessions); a "shareable link" version needs a backend + datastore, deferred to roadmap.
- **Sharing (later)**: read-only link so e.g. race volunteers or spectators can view a simulation without editing it. Not built.

### Feasibility

Doable, not exotic. Every core piece is a solved problem with mature open-source libraries, an integration project rather than an algorithmic one.

- Map + GPX overlay: standard geospatial demo territory (Leaflet + OSM). Low risk.
- Distance-along-route math: Turf.js's `length()` and `along()` functions do this directly, no custom implementation needed.
- The hard part isn't the math, it's messy real-world GPX data (GPS noise, sparse waypoints, missing elevation).

### Assumptions

- Route direction is implicit in point order in a GPX `<trk>` (dense recorded track), not stated separately.
- Assumes a dense recorded track, not a sparse `<rte>` (a handful of route-planning waypoints). Sparse routes would draw as jagged straight lines rather than road-following paths, unless snapped to roads via a routing API, that's a real gap, not just a "quality" concern. This is why the MVP rejects sparse routes outright rather than trying to handle them.
- "Quality GPX" mainly means limited GPS jitter (tunnels, urban canyon, tree cover) and no big point/time gaps. Noisy data can register phantom backtracking in the distance calc; a real product would want a simplification pass (Douglas-Peucker) at import. Not done in MVP.
- The GPX's own embedded timestamps are never used for the simulation, start time and pace are always user-supplied.

### Comparison to `app.mapdirector.com`

Checked live during planning. It's a "Cinematic Flyovers" tool (Story Elements, Map Elements, Screen Overlays, Flight Settings, Animation Settings, frame counter, video export), a camera-flythrough builder for producing map videos, not a pace/time person-position simulator. The "Flight Settings" vocabulary suggests Mapbox GL JS (its camera `flyTo`/keyframe APIs suit this), but it's a client-rendered SPA so internals couldn't be confirmed. Visually adjacent (something animates along a path on a map) but functionally different purpose, not really a competitor. Strava's route builder and Garmin's race predictor were flagged as worth a look but never checked.

### Resolved decisions

- Input is unpredictable (user-drawn, or exported from Strava/a watch), so the app validates on upload rather than trying to gracefully handle anything. If a file doesn't meet the criteria needed to display the route properly, it's rejected with a clear error rather than silently degrading.
- Sparse GPX (`<rte>`) is rejected rather than road-snapped, with an error explaining a recorded track is needed. No road-snapping dependency needed for MVP as a result.
- Validation rules: file must contain a `<trk>`, minimum point count, and a max-gap check between consecutive points (catches both sparse routes and GPS dropouts with one rule).
- Elevation: nice to have, explicitly deferred past MVP.
- Pace is always independently user-defined. A GPX's own recorded pace is never read or offered as a default.

### Stack

- **Hosting:** Vercel, deployed straight from GitHub (preview deploy per PR, production on merge to main)
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Map:** Leaflet + OpenStreetMap tiles, no API key, no backend proxy needed, fits a pure static SPA
- **Repo/CI:** GitHub, Vercel's GitHub integration is the CI/CD for MVP, no separate GitHub Actions pipeline yet
- **Architecture:** single page app, fully client-side for MVP, no backend, no persistence beyond the browser session

### Module breakdown

- `lib/gpx/` — parse + validate GPX against the upload criteria above
- `lib/geometry/` — cumulative distance, wraps Turf.js `length`/`along`
- `lib/simulation/` — pure functions: pace to speed, time to distance to position
- `components/MapView.tsx` — Leaflet map wrapper (react-leaflet)
- `components/RunnerControls.tsx` — start time + pace input
- `components/Timeline.tsx` — scrubber/play controls
- `store/simulationStore.ts` — Zustand store holding route, runner, clock time

## Solution design

### Folder structure

One component per file. Component files use **PascalCase** (`MapView.tsx`, not `map-view.tsx` or a `MapView/` folder), non-component modules (hooks, `lib/`, `store/`, `types/`) use camelCase, hooks keep the required `use` prefix (`useTimeline.ts`). Tests and (where applicable) Storybook stories colocated next to the file they cover. This mirrors the convention used in `/Users/travis/repos/github/rockacola/next-question/` (flat `components/` with a `ui/` subfolder for primitives, `lib/` organised by domain with one function per file, `Component.test.tsx` and `Component.stories.tsx` sitting next to `Component.tsx`), except that reference repo uses kebab-case throughout, this project deliberately does not.

```
paceplot/
  src/
    lib/
      gpx/
        parseGpx.ts             # parse GPX XML -> RoutePoint[]
        parseGpx.test.ts
        validateGpx.ts          # rules: has <trk>, min point count, max gap between points
        validateGpx.test.ts
      geometry/
        routeGeometry.ts        # wraps turf: cumulative distance, along()
        routeGeometry.test.ts
      simulation/
        pace.ts                 # pace <-> speed conversions
        pace.test.ts
        position.ts             # (route, runner, clockTime) -> lat/lng, pure function
        position.test.ts
    components/
      MapView.tsx                # react-leaflet, renders route polyline + runner marker, presentational only
      MapView.test.tsx
      GpxUpload.tsx               # file input, delegates parsing/validation to the hook below
      GpxUpload.test.tsx
      RunnerControls.tsx          # start time + pace form
      RunnerControls.test.tsx
      Timeline.tsx                 # scrubber + play/pause, presentational
      Timeline.test.tsx
      App.tsx
    hooks/
      useGpxUpload.ts             # file handling + parse/validate + error state, logic for GpxUpload.tsx
      useGpxUpload.test.ts
      useTimeline.ts               # scrub/play state + derived range bounds, logic for Timeline.tsx
      useTimeline.test.ts
    store/
      simulationStore.ts          # Zustand store: route, runner, clockTime, isPlaying
      simulationStore.test.ts
    types/
      route.ts                    # Route, RoutePoint
      runner.ts                   # Runner, Pace
    main.tsx
  index.html
  vite.config.ts
  tailwind.config.js
```

### Key types

```ts
type RoutePoint = { lat: number; lng: number; cumulativeDistanceM: number };
type Route = { id: string; name: string; points: RoutePoint[]; totalDistanceM: number };

type Pace = { minPerKm: number }; // constant only for MVP
type Runner = { id: string; name: string; startTime: Date; pace: Pace };
```

### State flow

- **Zustand** for global state (`store/simulationStore.ts`), decided up front rather than starting with Context/`useReducer` and refactoring later, adopted specifically to avoid that rework.
- Store holds `route`, `runner`, `clockTime`, `isPlaying`.
- `useGpxUpload` (hook) parses + validates on file selection, calls the store's `setRoute` only on success, exposes validation error state to `GpxUpload.tsx`.
- `RunnerControls` calls the store's `setRunner` directly, its form state is simple enough not to need its own hook.
- `useTimeline` (hook) owns scrub/play state and ticking, calls the store's `setClockTime`, exposes the derived range bounds to `Timeline.tsx`.
- `getRunnerPosition(route, runner, clockTime)` is a pure selector, not stored state. `MapView` derives the marker position from it (returns `null` before start / after finish).

### Component contracts

Each component with non-trivial logic gets a matching hook that owns that logic, the component itself stays presentational. `RunnerControls` is simple enough to skip this split.

- `GpxUpload` (+ `useGpxUpload`): the hook owns file handling, parsing, validation, and error state. The component only renders the file input and whatever error message the hook returns. Emits a `Route` to the store on success, no knowledge of the runner or the map.
- `RunnerControls`: owns the start time + pace form directly (no hook, form state is trivial). Writes a `Runner` to the store, no knowledge of route geometry.
- `Timeline` (+ `useTimeline`): the hook owns scrub/play state, ticking, and the derived range bounds (needs `route` + `runner`, start time to start + total duration at pace). The component only renders the scrubber/play controls the hook drives.
- `MapView`: purely presentational, given `route` + current position, renders polyline + marker. No business logic, no hook needed.

### Implementation order

Followed **TDD**: for each item, tests written first against fixture data or the intended contract, watched to fail, then implemented until they pass.

1. Types + GPX parser + validation, no UI, tests written first against fixture files (a clean recorded track, a sparse route, a too-few-points file)
2. Simulation pure functions (pace/time/position math), tests first, no UI dependency
3. `MapView` rendering a static route polyline, proves the Leaflet + OSM + Turf pipeline end to end
4. `simulationStore` (Zustand) wiring `route`/`runner`/`clockTime`, tests first against the store's public API
5. `useGpxUpload` + `GpxUpload`, `RunnerControls`, `useTimeline` + `Timeline`, wired to the store and to `MapView`
6. Polish: validation error UX, loading states, responsive layout

### Resolved decisions

- State management: **Zustand**, chosen up front over Context/`useReducer` specifically to avoid a later refactor.
- Testing: **TDD**, tests written before implementation for every module, not just added afterward for coverage.

### Build conventions

`/Users/travis/repos/github/rockacola/next-question/` was used as a style reference, not a template to copy wholesale. Carried over: one component per file with PascalCase component filenames and camelCase everything else, colocated tests, `lib/` organised by domain with one function per file, Storybook stories colocated only for presentational/reusable pieces, `npm run check` as a single composed quality gate. Not carried over: it's a Next.js + Prisma + Supabase app, none of that applies to this Vite SPA with no backend.

Dependency versions: installed latest stable of every dependency at setup time, not copied from the reference repo's `package.json` (that repo's pinned versions age over time).

Tooling: ESLint with `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-config-prettier`, plus `@typescript-eslint/consistent-type-imports`. Prettier (`semi: true`, `singleQuote: true`, `trailingComma: "es5"`, `printWidth: 100`, `tabWidth: 2`). TypeScript `strict: true`. Vitest + React Testing Library (not Jest, no Next.js-specific reason to use it here). Scripts: `dev`, `build`, `preview`, `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `test`, `test:watch`, `check` (format + lint:fix + typecheck), `storybook`, `build-storybook`.

Storybook: adopted only where it earns its place, presentational components with no store/hook dependency. Skipped for thin hook wrappers.

### Judgment calls made during the build

The spec above named the rules but left some numbers and edge behaviors open. Resolved while building:

- GPX validation thresholds: minimum 10 track points, max 500m gap between consecutive points
- Start time input is time-of-day applied to today's date, no date picker in MVP
- Timeline playback runs at 60x simulated speed (1 real second = 1 simulated minute), a 1x rate would make the scrubber the only usable control

### Outcome

Built 2026-08-20. `lib/gpx/`, `lib/geometry/`, `lib/simulation/` (TDD, tests first throughout), `MapView`/`GpxUpload`/`RunnerControls`/`Timeline` components, `useGpxUpload`/`useTimeline` hooks, single Zustand store, one Storybook story (`MapView`, the only component with no store/hook dependency). 44 tests, all passing. `npm run check`, `test`, `build`, and `build-storybook` all green. Dev server verified to boot and serve.
