import { RunnerCard } from './RunnerCard';
import type { RunnerFormEntry } from '../hooks/useRunnersForm';

type RunnerListProps = {
  entries: RunnerFormEntry[];
  addRunner: () => void;
  removeRunner: (id: string) => void;
  canAddRunner: boolean;
  canRemoveRunner: boolean;
};

export function RunnerList({
  entries,
  addRunner,
  removeRunner,
  canAddRunner,
  canRemoveRunner,
}: RunnerListProps) {
  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => (
        <RunnerCard
          key={entry.id}
          entry={entry}
          canRemove={canRemoveRunner}
          onRemove={() => removeRunner(entry.id)}
        />
      ))}
      <button
        type="button"
        onClick={addRunner}
        disabled={!canAddRunner}
        className="cursor-pointer rounded border border-dashed border-slate-300 px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        + Add runner
      </button>
    </div>
  );
}
