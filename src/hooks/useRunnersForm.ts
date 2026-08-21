import { useEffect, useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import {
  DEFAULT_PACE_MIN,
  DEFAULT_PACE_SEC,
  DEFAULT_START_TIME,
  MAX_RUNNERS,
  RUNNER_COLOR_PALETTE,
} from '../config/runnerDefaults';
import { getTimelineRange } from '../lib/simulation/timelineRange';
import { formatRunnerSummary } from '../lib/format/formatRunnerSummary';
import type { Runner } from '../types/runner';

type RunnerDraft = {
  timeValue: string;
  paceMinValue: string;
  paceSecValue: string;
};

export type RunnerFormEntry = {
  id: string;
  name: string;
  color: string;
  summary: string;
  timeValue: string;
  setTimeValue: (value: string) => void;
  paceMinValue: string;
  setPaceMinValue: (value: string) => void;
  paceSecValue: string;
  setPaceSecValue: (value: string) => void;
  setColor: (hex: string) => void;
  hasPendingChanges: boolean;
};

function toStartTime(timeValue: string): Date | null {
  const [hoursStr, minutesStr] = timeValue.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (!timeValue || Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatTimeValue(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// The inverse of the min/sec -> minPerKm formula apply() always uses, so this
// round-trips exactly: pace is never constructed any other way.
function runnerToDraft(runner: Runner): RunnerDraft {
  const totalSeconds = Math.round(runner.pace.minPerKm * 60);
  return {
    timeValue: formatTimeValue(runner.startTime),
    paceMinValue: String(Math.floor(totalSeconds / 60)),
    paceSecValue: String(totalSeconds % 60),
  };
}

function parseDraft(draft: RunnerDraft): { startTime: Date; minPerKm: number } | null {
  const startTime = toStartTime(draft.timeValue);
  const min = Number(draft.paceMinValue);
  const sec = Number(draft.paceSecValue);
  const isValid =
    startTime !== null &&
    !Number.isNaN(min) &&
    !Number.isNaN(sec) &&
    min >= 0 &&
    sec >= 0 &&
    sec < 60 &&
    min + sec / 60 > 0;
  return isValid ? { startTime, minPerKm: min + sec / 60 } : null;
}

function nextRunnerName(existing: Runner[]): string {
  const usedNumbers = existing
    .map((r) => /^Runner (\d+)$/.exec(r.name)?.[1])
    .filter((n): n is string => Boolean(n))
    .map(Number);
  const next = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;
  return `Runner ${next}`;
}

function nextUnusedColor(existing: Runner[]): string {
  const used = new Set(existing.map((r) => r.color));
  return RUNNER_COLOR_PALETTE.find((c) => !used.has(c)) ?? RUNNER_COLOR_PALETTE[0];
}

function buildDefaultRunner(existing: Runner[]): Runner {
  return {
    id: crypto.randomUUID(),
    name: nextRunnerName(existing),
    color: nextUnusedColor(existing),
    startTime: toStartTime(DEFAULT_START_TIME)!,
    pace: { minPerKm: DEFAULT_PACE_MIN + DEFAULT_PACE_SEC / 60 },
  };
}

// Whenever the committed runner set changes (add, remove, or applying edits),
// resync the shared clock to the new earliest start and stop playback.
// clockTime is an absolute Date; without this a stale clock left over from
// before the change can make a runner look like it hasn't started yet.
function resyncClock(runners: Runner[]) {
  const route = useSimulationStore.getState().route;
  const { rangeStart } = getTimelineRange(route, runners);
  useSimulationStore.getState().setClockTime(rangeStart);
  useSimulationStore.getState().setIsPlaying(false);
}

export function useRunnersForm() {
  const runners = useSimulationStore((state) => state.runners);
  const storeAddRunner = useSimulationStore((state) => state.addRunner);
  const storeUpdateRunner = useSimulationStore((state) => state.updateRunner);
  const storeRemoveRunner = useSimulationStore((state) => state.removeRunner);
  const [drafts, setDrafts] = useState<Record<string, RunnerDraft>>({});

  function draftFor(runner: Runner): RunnerDraft {
    return drafts[runner.id] ?? runnerToDraft(runner);
  }

  function isDirty(runner: Runner): boolean {
    const parsed = parseDraft(draftFor(runner));
    if (!parsed) return false;
    return (
      parsed.startTime.getTime() !== runner.startTime.getTime() ||
      parsed.minPerKm !== runner.pace.minPerKm
    );
  }

  function updateDraft(id: string, patch: Partial<RunnerDraft>) {
    setDrafts((prev) => {
      const runner = runners.find((r) => r.id === id);
      const base =
        prev[id] ??
        (runner ? runnerToDraft(runner) : { timeValue: '', paceMinValue: '', paceSecValue: '' });
      return { ...prev, [id]: { ...base, ...patch } };
    });
  }

  function setColor(id: string, hex: string) {
    const runner = runners.find((r) => r.id === id);
    if (!runner) return;
    storeUpdateRunner({ ...runner, color: hex });
  }

  // addRunner/removeRunner read the store's live runners (not the closed-over
  // `runners`) so their guards stay correct even across several calls batched
  // into one React update, e.g. a test or a fast double-click.
  function addRunner() {
    const current = useSimulationStore.getState().runners;
    if (current.length >= MAX_RUNNERS) return;
    const runner = buildDefaultRunner(current);
    storeAddRunner(runner);
    resyncClock([...current, runner]);
  }

  function removeRunner(id: string) {
    const current = useSimulationStore.getState().runners;
    if (current.length <= 1) return;
    storeRemoveRunner(id);
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    resyncClock(current.filter((r) => r.id !== id));
  }

  function applyAll() {
    const updated = runners.map((runner) => {
      const parsed = parseDraft(draftFor(runner));
      if (!parsed || !isDirty(runner)) return runner;
      const next: Runner = {
        ...runner,
        startTime: parsed.startTime,
        pace: { minPerKm: parsed.minPerKm },
      };
      storeUpdateRunner(next);
      return next;
    });
    resyncClock(updated);
  }

  // Seed exactly one default runner once, so the app is usable without the
  // user having to add one first; every subsequent runner is explicit.
  useEffect(() => {
    if (useSimulationStore.getState().runners.length === 0) {
      addRunner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entries: RunnerFormEntry[] = runners.map((runner) => {
    const draft = draftFor(runner);
    return {
      id: runner.id,
      name: runner.name,
      color: runner.color,
      summary: formatRunnerSummary(runner),
      timeValue: draft.timeValue,
      setTimeValue: (value: string) => updateDraft(runner.id, { timeValue: value }),
      paceMinValue: draft.paceMinValue,
      setPaceMinValue: (value: string) => updateDraft(runner.id, { paceMinValue: value }),
      paceSecValue: draft.paceSecValue,
      setPaceSecValue: (value: string) => updateDraft(runner.id, { paceSecValue: value }),
      setColor: (hex: string) => setColor(runner.id, hex),
      hasPendingChanges: isDirty(runner),
    };
  });

  return {
    entries,
    addRunner,
    removeRunner,
    applyAll,
    canAddRunner: runners.length < MAX_RUNNERS,
    canRemoveRunner: runners.length > 1,
    hasPendingChanges: entries.some((e) => e.hasPendingChanges),
  };
}
