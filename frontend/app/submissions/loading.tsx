import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export default function SubmissionsLoading() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Skeleton variant="text" width={180} height={40} />
        <Skeleton variant="rounded" height={72} />
        <Skeleton variant="rounded" height={400} />
      </Stack>
    </Container>
  );
}
