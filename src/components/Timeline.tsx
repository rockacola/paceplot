import { useTimeline } from '../hooks/useTimeline';
import { useSimulationStore } from '../store/simulationStore';
import { PlaybackSpeedControl } from './PlaybackSpeedControl';

export function Timeline() {
  const route = useSimulationStore((state) => state.route);
  const runners = useSimulationStore((state) => state.runners);
  const { rangeStart, rangeEnd, clockTime, isPlaying, scrub, play, pause } = useTimeline();

  const isReady = Boolean(route && runners.length > 0);
  const current = clockTime ?? rangeStart;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={!isReady}
        onClick={isPlaying ? pause : play}
        className="cursor-pointer rounded bg-slate-700 px-4 py-2 text-base text-white hover:bg-slate-600 active:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:bg-slate-300 disabled:active:bg-slate-300"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <input
        type="range"
        role="slider"
        disabled={!isReady}
        min={rangeStart.getTime()}
        max={rangeEnd.getTime()}
        value={current.getTime()}
        onChange={(e) => scrub(new Date(Number(e.target.value)))}
        className="flex-1 disabled:cursor-not-allowed disabled:opacity-40"
      />
      <span className="text-base tabular-nums text-slate-600">
        {isReady
          ? current.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          : '--:--:--'}
      </span>
      <PlaybackSpeedControl />
    </div>
  );
}
