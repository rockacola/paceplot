import { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';

function toStartTime(timeValue: string): Date | null {
  const [hoursStr, minutesStr] = timeValue.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (!timeValue || Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function RunnerControls() {
  const runner = useSimulationStore((state) => state.runner);
  const setRunner = useSimulationStore((state) => state.setRunner);
  const [timeValue, setTimeValue] = useState('');
  const [paceValue, setPaceValue] = useState('');

  function commit(nextTimeValue: string, nextPaceValue: string) {
    const startTime = toStartTime(nextTimeValue);
    const minPerKm = Number(nextPaceValue);
    if (!startTime || !nextPaceValue || Number.isNaN(minPerKm) || minPerKm <= 0) return;
    setRunner({
      id: runner?.id ?? crypto.randomUUID(),
      name: runner?.name ?? 'Runner 1',
      startTime,
      pace: { minPerKm },
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="runner-start-time" className="text-sm font-medium text-slate-700">
        Start time
      </label>
      <input
        id="runner-start-time"
        type="time"
        value={timeValue}
        onChange={(e) => {
          setTimeValue(e.target.value);
          commit(e.target.value, paceValue);
        }}
        className="text-sm"
      />
      <label htmlFor="runner-pace" className="text-sm font-medium text-slate-700">
        Pace (min/km)
      </label>
      <input
        id="runner-pace"
        type="number"
        step="0.1"
        min="0"
        value={paceValue}
        onChange={(e) => {
          setPaceValue(e.target.value);
          commit(timeValue, e.target.value);
        }}
        className="text-sm"
      />
    </div>
  );
}
