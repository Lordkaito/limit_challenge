'use client';

import { Alert, Button, Container, Stack } from '@mui/material';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SubmissionsError({ error, reset }: Props) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reset}>
              Retry
            </Button>
          }
        >
          {error.message ?? 'Something went wrong loading submissions.'}
        </Alert>
      </Stack>
    </Container>
  );
}
