import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { getTimelineRange } from '../lib/simulation/timelineRange';
import { getTickIntervalMs } from '../config/simulationConfig';

export function useTimeline() {
  const route = useSimulationStore((state) => state.route);
  const runners = useSimulationStore((state) => state.runners);
  const clockTime = useSimulationStore((state) => state.clockTime);
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const playbackSpeed = useSimulationStore((state) => state.playbackSpeed);
  const setClockTime = useSimulationStore((state) => state.setClockTime);
  const setIsPlaying = useSimulationStore((state) => state.setIsPlaying);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Memoized so rangeStart/rangeEnd only change identity when route or
  // runners actually change, not on every clockTime tick. Without this, the
  // effect below (which depends on them) tears down and recreates the
  // interval on every single tick instead of running one stable timer.
  const { rangeStart, rangeEnd } = useMemo(
    () => getTimelineRange(route, runners),
    [route, runners]
  );
  const tickIntervalMs = getTickIntervalMs(playbackSpeed);

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
    const current = useSimulationStore.getState().clockTime ?? rangeStart;
    if (current.getTime() >= rangeEnd.getTime()) {
      setClockTime(rangeStart);
    }
    setIsPlaying(true);
  }, [setIsPlaying, setClockTime, rangeStart, rangeEnd]);

  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      const current = useSimulationStore.getState().clockTime ?? rangeStart;
      const next = new Date(current.getTime() + tickIntervalMs * playbackSpeed);
      if (next.getTime() >= rangeEnd.getTime()) {
        setClockTime(rangeEnd);
        pause();
      } else {
        setClockTime(next);
      }
    }, tickIntervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackSpeed, tickIntervalMs, rangeStart, rangeEnd, setClockTime, pause]);

  return { rangeStart, rangeEnd, clockTime, isPlaying, scrub, play, pause };
}
