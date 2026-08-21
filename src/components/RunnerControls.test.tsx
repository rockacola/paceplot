import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RunnerControls } from './RunnerControls';

function baseProps() {
  return {
    runnerId: 'runner-1',
    timeValue: '07:30',
    setTimeValue: vi.fn(),
    paceMinValue: '6',
    setPaceMinValue: vi.fn(),
    paceSecValue: '0',
    setPaceSecValue: vi.fn(),
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

  it('namespaces its field ids by runnerId, so two instances never collide', () => {
    const { container: containerA } = render(<RunnerControls {...baseProps()} runnerId="a" />);
    const { container: containerB } = render(<RunnerControls {...baseProps()} runnerId="b" />);
    const idA = containerA.querySelector('input[type="time"]')?.id;
    const idB = containerB.querySelector('input[type="time"]')?.id;
    expect(idA).not.toBe(idB);
  });
});
