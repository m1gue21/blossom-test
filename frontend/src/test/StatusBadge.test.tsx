import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/ui/StatusBadge';

describe('StatusBadge', () => {
  it('renders Alive status with green styling', () => {
    render(<StatusBadge status="Alive" />);
    const badge = screen.getByText('Alive');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('green');
  });

  it('renders Dead status with red styling', () => {
    render(<StatusBadge status="Dead" />);
    const badge = screen.getByText('Dead');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('red');
  });

  it('renders unknown status with gray styling', () => {
    render(<StatusBadge status="unknown" />);
    const badge = screen.getByText('unknown');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('gray');
  });

  it('renders unknown status for unrecognized values', () => {
    render(<StatusBadge status="weird_status" />);
    const badge = screen.getByText('weird_status');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('gray');
  });
});
