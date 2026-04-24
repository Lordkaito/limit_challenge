import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('shows no-submissions message when no active filters', () => {
    render(<EmptyState hasActiveFilters={false} />);
    expect(screen.getByText('No submissions yet')).toBeInTheDocument();
  });

  it('shows no-matches message when filters are active', () => {
    render(<EmptyState hasActiveFilters={true} />);
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });

  it('shows Clear filters button when filters active and onClear provided', () => {
    const onClear = jest.fn();
    render(<EmptyState hasActiveFilters={true} onClear={onClear} />);
    const btn = screen.getByRole('button', { name: /clear filters/i });
    fireEvent.click(btn);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('does not show Clear filters button without onClear', () => {
    render(<EmptyState hasActiveFilters={true} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
