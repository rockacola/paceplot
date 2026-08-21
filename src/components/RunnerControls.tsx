type RunnerControlsProps = {
  runnerId: string;
  timeValue: string;
  setTimeValue: (value: string) => void;
  paceMinValue: string;
  setPaceMinValue: (value: string) => void;
  paceSecValue: string;
  setPaceSecValue: (value: string) => void;
};

export function RunnerControls({
  runnerId,
  timeValue,
  setTimeValue,
  paceMinValue,
  setPaceMinValue,
  paceSecValue,
  setPaceSecValue,
}: RunnerControlsProps) {
  const startTimeId = `runner-start-time-${runnerId}`;
  const paceLabelId = `runner-pace-label-${runnerId}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={startTimeId} className="text-base font-medium text-slate-700">
          Start time
        </label>
        <input
          id={startTimeId}
          type="time"
          value={timeValue}
          onChange={(e) => setTimeValue(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1.5 text-base"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span id={paceLabelId} className="text-base font-medium text-slate-700">
          Pace (per km)
        </span>
        <div role="group" aria-labelledby={paceLabelId} className="flex items-center gap-1.5">
          <input
            aria-label="Pace minutes"
            type="number"
            min="0"
            value={paceMinValue}
            onChange={(e) => setPaceMinValue(e.target.value)}
            className="w-16 rounded border border-slate-300 px-2 py-1.5 text-base"
          />
          <span className="text-base text-slate-500">min</span>
          <input
            aria-label="Pace seconds"
            type="number"
            min="0"
            max="59"
            value={paceSecValue}
            onChange={(e) => setPaceSecValue(e.target.value)}
            className="w-16 rounded border border-slate-300 px-2 py-1.5 text-base"
          />
          <span className="text-base text-slate-500">sec</span>
        </div>
      </div>
    </div>
  );
}
