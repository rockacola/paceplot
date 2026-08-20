import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RunnerControls } from './RunnerControls';

function baseProps() {
  return {
    timeValue: '07:30',
    setTimeValue: vi.fn(),
    paceMinValue: '6',
    setPaceMinValue: vi.fn(),
    paceSecValue: '0',
    setPaceSecValue: vi.fn(),
    color: '#2563eb',
  };
}

describe('RunnerControls', () => {
  it('renders the given start time and pace values', () => {
    render(<RunnerControls {...baseProps()} />);
    expect(screen.getByLabelText(/start time/i)).toHaveValue('07:30');
    expect(screen.getByLabelText('Pace minutes')).toHaveValue(6);
    expect(screen.getByLabelText('Pace seconds')).toHaveValue(0);
  });

  it('calls setPaceMinValue as the minutes field is edited', async () => {
    const props = baseProps();
    render(<RunnerControls {...props} />);
    await userEvent.type(screen.getByLabelText('Pace minutes'), '5');
    expect(props.setPaceMinValue).toHaveBeenCalled();
  });

  it('calls setTimeValue as the start time field is edited', async () => {
    const props = baseProps();
    render(<RunnerControls {...props} />);
    await userEvent.clear(screen.getByLabelText(/start time/i));
    await userEvent.type(screen.getByLabelText(/start time/i), '0800');
    expect(props.setTimeValue).toHaveBeenCalled();
  });

  it('renders a color swatch next to the grouped inputs', () => {
    const { container } = render(<RunnerControls {...baseProps()} />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
