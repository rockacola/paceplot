import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RunnerApplyButton } from './RunnerApplyButton';

describe('RunnerApplyButton', () => {
  it('is disabled when there are no pending changes', () => {
    render(<RunnerApplyButton hasPendingChanges={false} onApply={() => {}} />);
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
  });

  it('is enabled when there are pending changes, and calls onApply when clicked', async () => {
    const onApply = vi.fn();
    render(<RunnerApplyButton hasPendingChanges={true} onApply={onApply} />);
    const button = screen.getByRole('button', { name: 'Apply' });
    expect(button).toBeEnabled();

    await userEvent.click(button);
    expect(onApply).toHaveBeenCalledOnce();
  });
});
