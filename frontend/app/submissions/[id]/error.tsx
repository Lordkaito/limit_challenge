'use client';

import { Alert, Button, Container, Stack } from '@mui/material';
import Link from 'next/link';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SubmissionDetailError({ error, reset }: Props) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reset}>
              Retry
            </Button>
          }
        >
          {error.message ?? 'Failed to load this submission.'}
        </Alert>
        <Button
          component={Link}
          href="/submissions"
          variant="outlined"
          size="small"
          sx={{ width: 'fit-content' }}
        >
          Back to submissions
        </Button>
      </Stack>
    </Container>
  );
}
