import { render, screen } from '@testing-library/react';
import { PriorityChip } from '../PriorityChip';

describe('PriorityChip', () => {
  it('renders "High" for high priority', () => {
    render(<PriorityChip priority="high" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders "Medium" for medium priority', () => {
    render(<PriorityChip priority="medium" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders "Low" for low priority', () => {
    render(<PriorityChip priority="low" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });
});
