import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '@/components/ui/Pagination';

describe('Pagination', () => {
  it('renders nothing when pages <= 1', () => {
    const { container } = render(
      <Pagination page={1} pages={1} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders pagination when pages > 1', () => {
    render(<Pagination page={1} pages={5} onPageChange={vi.fn()} />);
    expect(screen.getByText('Next →')).toBeInTheDocument();
    expect(screen.getByText('← Prev')).toBeInTheDocument();
  });

  it('disables Prev button on first page', () => {
    render(<Pagination page={1} pages={5} onPageChange={vi.fn()} />);
    const prevBtn = screen.getByText('← Prev');
    expect(prevBtn).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(<Pagination page={5} pages={5} onPageChange={vi.fn()} />);
    const nextBtn = screen.getByText('Next →');
    expect(nextBtn).toBeDisabled();
  });

  it('calls onPageChange with correct page when clicking Next', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('Next →'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange with correct page when clicking Prev', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} pages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('← Prev'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
