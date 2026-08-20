type RunnerApplyButtonProps = {
  hasPendingChanges: boolean;
  onApply: () => void;
};

export function RunnerApplyButton({ hasPendingChanges, onApply }: RunnerApplyButtonProps) {
  return (
    <button
      type="button"
      onClick={onApply}
      disabled={!hasPendingChanges}
      className="w-full cursor-pointer rounded bg-slate-700 px-4 py-2 text-base font-medium text-white hover:bg-slate-600 active:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:bg-slate-300 disabled:active:bg-slate-300"
    >
      Apply
    </button>
  );
}
