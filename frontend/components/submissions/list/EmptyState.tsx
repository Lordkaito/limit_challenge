import { Box, Button, Typography } from '@mui/material';

interface Props {
  hasActiveFilters: boolean;
  onClear?: () => void;
}

export function EmptyState({ hasActiveFilters, onClear }: Props) {
  if (hasActiveFilters) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No matches
        </Typography>
        <Typography color="text.disabled" mb={2}>
          No submissions match the active filters.
        </Typography>
        {onClear && (
          <Button variant="outlined" size="small" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box textAlign="center" py={8}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No submissions yet
      </Typography>
      <Typography color="text.disabled">
        Submissions will appear here once brokers start sending opportunities.
      </Typography>
    </Box>
  );
}
