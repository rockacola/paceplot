import { PLAYBACK_SPEED_OPTIONS, type PlaybackSpeed } from '../config/simulationConfig';
import { useSimulationStore } from '../store/simulationStore';

export function PlaybackSpeedControl() {
  const playbackSpeed = useSimulationStore((state) => state.playbackSpeed);
  const setPlaybackSpeed = useSimulationStore((state) => state.setPlaybackSpeed);

  return (
    <label className="flex items-center gap-1.5">
      <span className="sr-only">Playback speed</span>
      <select
        value={playbackSpeed}
        onChange={(e) => setPlaybackSpeed(Number(e.target.value) as PlaybackSpeed)}
        className="cursor-pointer rounded border border-slate-300 px-2 py-1.5 text-base text-slate-700"
      >
        {PLAYBACK_SPEED_OPTIONS.map((speed) => (
          <option key={speed} value={speed}>
            x{speed}
          </option>
        ))}
      </select>
    </label>
  );
}
