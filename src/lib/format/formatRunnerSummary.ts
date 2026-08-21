import type { Runner } from '../../types/runner';

function formatStartTime(startTime: Date): string {
  return startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatPace(minPerKm: number): string {
  const totalSeconds = Math.round(minPerKm * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function formatRunnerSummary(runner: Runner): string {
  return `${runner.name} starts ${formatStartTime(runner.startTime)} @ ${formatPace(runner.pace.minPerKm)}/km`;
}
