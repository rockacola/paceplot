import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { paceToSpeedMps } from '../lib/simulation/pace';

const TICK_INTERVAL_MS = 250;
// Watching a race unfold in real time isn't useful for planning; simulated
// time runs faster than the wall clock while playing.
const PLAYBACK_MULTIPLIER = 60;

export function useTimeline() {
  const route = useSimulationStore((state) => state.route);
  const runner = useSimulationStore((state) => state.runner);
  const clockTime = useSimulationStore((state) => state.clockTime);
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const setClockTime = useSimulationStore((state) => state.setClockTime);
  const setIsPlaying = useSimulationStore((state) => state.setIsPlaying);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const rangeStart = useMemo(() => runner?.startTime ?? new Date(0), [runner]);
  const rangeEnd = useMemo(() => {
    if (!runner || !route || route.totalDistanceM === 0) return rangeStart;
    const speedMps = paceToSpeedMps(runner.pace.minPerKm);
    const durationMs = (route.totalDistanceM / speedMps) * 1000;
    return new Date(rangeStart.getTime() + durationMs);
  }, [runner, route, rangeStart]);

  const scrub = useCallback(
    (time: Date) => {
      setClockTime(time);
    },
    [setClockTime]
  );

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, [setIsPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      const current = useSimulationStore.getState().clockTime ?? rangeStart;
      const next = new Date(current.getTime() + TICK_INTERVAL_MS * PLAYBACK_MULTIPLIER);
      if (next.getTime() >= rangeEnd.getTime()) {
        setClockTime(rangeEnd);
        pause();
      } else {
        setClockTime(next);
      }
    }, TICK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, rangeStart, rangeEnd, setClockTime, pause]);

  return { rangeStart, rangeEnd, clockTime, isPlaying, scrub, play, pause };
}
