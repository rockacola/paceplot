import { useTimeline } from '../hooks/useTimeline';
import { useSimulationStore } from '../store/simulationStore';

export function Timeline() {
  const runner = useSimulationStore((state) => state.runner);
  const { rangeStart, rangeEnd, clockTime, isPlaying, scrub, play, pause } = useTimeline();

  if (!runner) return null;

  const current = clockTime ?? rangeStart;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={isPlaying ? pause : play}
        className="rounded bg-slate-700 px-3 py-1 text-sm text-white"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <input
        type="range"
        role="slider"
        min={rangeStart.getTime()}
        max={rangeEnd.getTime()}
        value={current.getTime()}
        onChange={(e) => scrub(new Date(Number(e.target.value)))}
        className="flex-1"
      />
      <span className="text-sm tabular-nums text-slate-600">
        {current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
}
