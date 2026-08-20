import { useEffect, useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import {
  DEFAULT_PACE_MIN,
  DEFAULT_PACE_SEC,
  DEFAULT_RUNNER_COLOR,
  DEFAULT_START_TIME,
} from '../config/runnerDefaults';

function toStartTime(timeValue: string): Date | null {
  const [hoursStr, minutesStr] = timeValue.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (!timeValue || Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function useRunnerForm() {
  const runner = useSimulationStore((state) => state.runner);
  const setRunner = useSimulationStore((state) => state.setRunner);
  const [timeValue, setTimeValue] = useState(DEFAULT_START_TIME);
  const [paceMinValue, setPaceMinValue] = useState(String(DEFAULT_PACE_MIN));
  const [paceSecValue, setPaceSecValue] = useState(String(DEFAULT_PACE_SEC));

  const pendingStartTime = toStartTime(timeValue);
  const pendingMin = Number(paceMinValue);
  const pendingSec = Number(paceSecValue);
  const isValid =
    pendingStartTime !== null &&
    !Number.isNaN(pendingMin) &&
    !Number.isNaN(pendingSec) &&
    pendingMin >= 0 &&
    pendingSec >= 0 &&
    pendingSec < 60 &&
    pendingMin + pendingSec / 60 > 0;
  const pendingMinPerKm = isValid ? pendingMin + pendingSec / 60 : null;

  // Nothing to apply once the pending fields match what's already committed
  // (or, before anything has ever been committed, there's always something).
  const hasPendingChanges =
    isValid &&
    (!runner ||
      pendingStartTime!.getTime() !== runner.startTime.getTime() ||
      pendingMinPerKm !== runner.pace.minPerKm);

  function apply() {
    if (!isValid || pendingStartTime === null || pendingMinPerKm === null) return;

    const current = useSimulationStore.getState().runner;
    setRunner({
      id: current?.id ?? crypto.randomUUID(),
      name: current?.name ?? 'Runner 1',
      color: current?.color ?? DEFAULT_RUNNER_COLOR,
      startTime: pendingStartTime,
      pace: { minPerKm: pendingMinPerKm },
    });
    // clockTime is an absolute Date; if it isn't re-synced here, a start time
    // moved later than the current clockTime leaves the runner "not started
    // yet" (negative elapsed time) and the marker silently disappears until
    // playback happens to tick past the new start.
    useSimulationStore.getState().setClockTime(pendingStartTime);
    useSimulationStore.getState().setIsPlaying(false);
  }

  // Commit the defaults once on mount so the app is usable without the user
  // having to press Apply first; every edit after that stays local until Apply.
  useEffect(() => {
    apply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    timeValue,
    setTimeValue,
    paceMinValue,
    setPaceMinValue,
    paceSecValue,
    setPaceSecValue,
    apply,
    hasPendingChanges,
    color: runner?.color ?? DEFAULT_RUNNER_COLOR,
  };
}
