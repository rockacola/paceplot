import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSwatchPicker } from './ColorSwatchPicker';

const colors = ['#2563eb', '#dc2626', '#16a34a'];

describe('ColorSwatchPicker', () => {
  it('renders one swatch per color', () => {
    render(<ColorSwatchPicker colors={colors} selected={colors[0]} onSelect={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(colors.length);
  });

  it('marks the selected color as pressed, and others as not', () => {
    render(<ColorSwatchPicker colors={colors} selected={colors[1]} onSelect={() => {}} />);
    expect(screen.getByLabelText(colors[1])).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText(colors[0])).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSelect with the clicked color', async () => {
    const onSelect = vi.fn();
    render(<ColorSwatchPicker colors={colors} selected={colors[0]} onSelect={onSelect} />);
    await userEvent.click(screen.getByLabelText(colors[2]));
    expect(onSelect).toHaveBeenCalledWith(colors[2]);
  });
});
