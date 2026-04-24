import { render, screen } from '@testing-library/react';
import { StatusChip } from '../StatusChip';

describe('StatusChip', () => {
  it('renders "New" for status new', () => {
    render(<StatusChip status="new" />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders "In Review" for status in_review', () => {
    render(<StatusChip status="in_review" />);
    expect(screen.getByText('In Review')).toBeInTheDocument();
  });

  it('renders "Closed" for status closed', () => {
    render(<StatusChip status="closed" />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('renders "Lost" for status lost', () => {
    render(<StatusChip status="lost" />);
    expect(screen.getByText('Lost')).toBeInTheDocument();
  });
});
