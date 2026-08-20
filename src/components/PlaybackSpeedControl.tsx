import { PLAYBACK_SPEED_OPTIONS } from '../config/simulationConfig';
import { useSimulationStore } from '../store/simulationStore';

export function PlaybackSpeedControl() {
  const playbackSpeed = useSimulationStore((state) => state.playbackSpeed);
  const setPlaybackSpeed = useSimulationStore((state) => state.setPlaybackSpeed);

  return (
    <div role="group" aria-label="Playback speed" className="flex gap-2">
      {PLAYBACK_SPEED_OPTIONS.map((speed) => (
        <button
          key={speed}
          type="button"
          aria-pressed={playbackSpeed === speed}
          onClick={() => setPlaybackSpeed(speed)}
          className={
            playbackSpeed === speed
              ? 'cursor-pointer rounded bg-slate-700 px-3 py-1.5 text-base font-medium text-white hover:bg-slate-600 active:bg-slate-800'
              : 'cursor-pointer rounded border border-slate-300 px-3 py-1.5 text-base font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100'
          }
        >
          x{speed}
        </button>
      ))}
    </div>
  );
}
