import { Alert, Button, Stack } from '@mui/material';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <Stack alignItems="flex-start" p={3}>
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      >
        {message ?? 'Failed to load submissions. Please try again.'}
      </Alert>
    </Stack>
  );
}
