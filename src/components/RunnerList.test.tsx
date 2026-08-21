import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RunnerList } from './RunnerList';
import type { RunnerFormEntry } from '../hooks/useRunnersForm';

function makeEntry(overrides: Partial<RunnerFormEntry>): RunnerFormEntry {
  return {
    id: 'runner-1',
    name: 'Runner 1',
    color: '#2563eb',
    summary: 'Runner 1 starts 7:30 AM @ 6:00/km',
    timeValue: '07:30',
    setTimeValue: vi.fn(),
    paceMinValue: '6',
    setPaceMinValue: vi.fn(),
    paceSecValue: '0',
    setPaceSecValue: vi.fn(),
    setColor: vi.fn(),
    hasPendingChanges: false,
    ...overrides,
  };
}

describe('RunnerList', () => {
  it('renders one card per entry', () => {
    const entries = [
      makeEntry({ id: 'runner-1', name: 'Runner 1' }),
      makeEntry({ id: 'runner-2', name: 'Runner 2' }),
    ];
    render(
      <RunnerList
        entries={entries}
        addRunner={() => {}}
        removeRunner={() => {}}
        canAddRunner={true}
        canRemoveRunner={true}
      />
    );
    expect(screen.getByText('Runner 1', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Runner 2', { selector: 'span' })).toBeInTheDocument();
  });

  it('calls addRunner when "Add runner" is clicked, and disables it when canAddRunner is false', async () => {
    const addRunner = vi.fn();
    const { rerender } = render(
      <RunnerList
        entries={[makeEntry({})]}
        addRunner={addRunner}
        removeRunner={() => {}}
        canAddRunner={true}
        canRemoveRunner={false}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /add runner/i }));
    expect(addRunner).toHaveBeenCalledOnce();

    rerender(
      <RunnerList
        entries={[makeEntry({})]}
        addRunner={addRunner}
        removeRunner={() => {}}
        canAddRunner={false}
        canRemoveRunner={false}
      />
    );
    expect(screen.getByRole('button', { name: /add runner/i })).toBeDisabled();
  });

  it('calls removeRunner with the right id when a card is removed', async () => {
    const removeRunner = vi.fn();
    const entries = [makeEntry({ id: 'runner-1' }), makeEntry({ id: 'runner-2' })];
    render(
      <RunnerList
        entries={entries}
        addRunner={() => {}}
        removeRunner={removeRunner}
        canAddRunner={true}
        canRemoveRunner={true}
      />
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await userEvent.click(removeButtons[0]);
    expect(removeRunner).toHaveBeenCalledWith('runner-1');
  });
});
