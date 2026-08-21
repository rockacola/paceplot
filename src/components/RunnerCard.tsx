import { useState } from 'react';
import { ColorSwatchPicker } from './ColorSwatchPicker';
import { RunnerControls } from './RunnerControls';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { RUNNER_COLOR_PALETTE } from '../config/runnerDefaults';
import type { RunnerFormEntry } from '../hooks/useRunnersForm';

type RunnerCardProps = {
  entry: RunnerFormEntry;
  canRemove: boolean;
  onRemove: () => void;
};

export function RunnerCard({ entry, canRemove, onRemove }: RunnerCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

  return (
    <div className="rounded border border-slate-200">
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={() => setIsColorModalOpen(true)}
          aria-label={`Change color for ${entry.name}`}
          className="flex shrink-0 cursor-pointer items-center px-2 hover:bg-slate-50 active:bg-slate-100"
        >
          <span
            aria-hidden="true"
            style={{ backgroundColor: entry.color }}
            className="h-3.5 w-3.5 shrink-0 rounded-full"
          />
        </button>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          className="flex flex-1 cursor-pointer items-center gap-2 py-2 pr-2 text-left hover:bg-slate-50 active:bg-slate-100"
        >
          <span className="min-w-0 flex-1 text-base text-slate-700">
            {isExpanded ? entry.name : entry.summary}
          </span>
          <Icon
            name="chevron-down"
            className={`shrink-0 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove runner"
            className="shrink-0 cursor-pointer px-2 text-slate-400 hover:bg-red-50 hover:text-red-600 active:bg-red-100"
          >
            <Icon name="close" />
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="flex flex-col gap-4 border-t border-slate-200 p-3">
          <RunnerControls
            runnerId={entry.id}
            timeValue={entry.timeValue}
            setTimeValue={entry.setTimeValue}
            paceMinValue={entry.paceMinValue}
            setPaceMinValue={entry.setPaceMinValue}
            paceSecValue={entry.paceSecValue}
            setPaceSecValue={entry.setPaceSecValue}
          />
        </div>
      )}
      <Modal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        title={`${entry.name} color`}
      >
        <ColorSwatchPicker
          colors={[...RUNNER_COLOR_PALETTE]}
          selected={entry.color}
          onSelect={(hex) => {
            entry.setColor(hex);
            setIsColorModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
