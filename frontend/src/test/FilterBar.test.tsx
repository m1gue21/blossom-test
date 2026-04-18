import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '@/components/FilterBar';

describe('FilterBar', () => {
  const defaultFilters = { sort: 'asc' as const, page: 1 };

  it('renders all filter controls', () => {
    render(<FilterBar filters={defaultFilters} onChange={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByTestId('filter-name')).toBeInTheDocument();
    expect(screen.getByTestId('filter-status')).toBeInTheDocument();
    expect(screen.getByTestId('filter-species')).toBeInTheDocument();
    expect(screen.getByTestId('filter-gender')).toBeInTheDocument();
    expect(screen.getByTestId('filter-sort')).toBeInTheDocument();
  });

  it('calls onChange when name input changes', () => {
    const onChange = vi.fn();
    render(<FilterBar filters={defaultFilters} onChange={onChange} onReset={vi.fn()} />);
    fireEvent.change(screen.getByTestId('filter-name'), { target: { value: 'Rick' } });
    expect(onChange).toHaveBeenCalledWith({ name: 'Rick', page: 1 });
  });

  it('calls onChange when status changes', () => {
    const onChange = vi.fn();
    render(<FilterBar filters={defaultFilters} onChange={onChange} onReset={vi.fn()} />);
    fireEvent.change(screen.getByTestId('filter-status'), { target: { value: 'Alive' } });
    expect(onChange).toHaveBeenCalledWith({ status: 'Alive', page: 1 });
  });

  it('does not show reset button when no active filters', () => {
    render(<FilterBar filters={defaultFilters} onChange={vi.fn()} onReset={vi.fn()} />);
    expect(screen.queryByTitle('Clear filters')).not.toBeInTheDocument();
  });

  it('shows reset button when name filter is active', () => {
    render(
      <FilterBar
        filters={{ ...defaultFilters, name: 'Rick' }}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    );
    expect(screen.getByTitle('Clear filters')).toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', () => {
    const onReset = vi.fn();
    render(
      <FilterBar
        filters={{ ...defaultFilters, name: 'Rick' }}
        onChange={vi.fn()}
        onReset={onReset}
      />
    );
    fireEvent.click(screen.getByTitle('Clear filters'));
    expect(onReset).toHaveBeenCalled();
  });
});
