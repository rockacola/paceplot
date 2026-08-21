import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RunnerCard } from './RunnerCard';
import type { RunnerFormEntry } from '../hooks/useRunnersForm';

function baseEntry(overrides: Partial<RunnerFormEntry> = {}): RunnerFormEntry {
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

describe('RunnerCard', () => {
  it('shows just the name while expanded, and the editable fields', () => {
    render(<RunnerCard entry={baseEntry()} canRemove={false} onRemove={() => {}} />);
    expect(screen.getByText('Runner 1', { selector: 'span' })).toBeInTheDocument();
    expect(screen.queryByText(/starts.*@/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
  });

  it('shows the full summary once collapsed, and hides the fields', async () => {
    render(<RunnerCard entry={baseEntry()} canRemove={false} onRemove={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: 'Runner 1' }));

    expect(screen.getByText('Runner 1 starts 7:30 AM @ 6:00/km')).toBeInTheDocument();
    expect(screen.queryByLabelText(/start time/i)).not.toBeInTheDocument();
  });

  it('re-expands to show just the name again', async () => {
    render(<RunnerCard entry={baseEntry()} canRemove={false} onRemove={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: 'Runner 1' }));
    await userEvent.click(screen.getByRole('button', { name: /starts 7:30 AM/ }));

    expect(screen.getByText('Runner 1', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
  });

  it('shows a remove button only when canRemove is true, and calls onRemove when clicked', async () => {
    const onRemove = vi.fn();
    const { rerender } = render(
      <RunnerCard entry={baseEntry()} canRemove={false} onRemove={onRemove} />
    );
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();

    rerender(<RunnerCard entry={baseEntry()} canRemove={true} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('opens a color picker modal when the color swatch is clicked, and picking a swatch commits it and closes', async () => {
    const entry = baseEntry();
    render(<RunnerCard entry={entry} canRemove={false} onRemove={() => {}} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /change color/i }));
    const dialog = screen.getByRole('dialog');
    const swatches = screen.getAllByRole('button', { name: /^#/ });
    expect(swatches.length).toBeGreaterThan(1);

    await userEvent.click(swatches[1]);
    expect(entry.setColor).toHaveBeenCalledWith(swatches[1].getAttribute('aria-label'));
    expect(dialog).not.toBeInTheDocument();
  });
});
