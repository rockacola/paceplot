import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('defaults to a 16px sized svg', () => {
    const { container } = render(<Icon name="upload" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });

  it('renders at the given size', () => {
    const { container } = render(<Icon name="upload" size={24} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('is hidden from assistive tech, since it is always paired with visible text', () => {
    const { container } = render(<Icon name="upload" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
