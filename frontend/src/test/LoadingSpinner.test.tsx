import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without text by default', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with loading text when provided', () => {
    render(<LoadingSpinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('applies correct size class for sm', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinEl = container.querySelector('.h-6.w-6');
    expect(spinEl).toBeInTheDocument();
  });

  it('applies correct size class for lg', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinEl = container.querySelector('.h-16.w-16');
    expect(spinEl).toBeInTheDocument();
  });
});
