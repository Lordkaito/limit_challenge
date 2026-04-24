import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export function DetailSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="text" width={260} height={48} />
      <Card variant="outlined">
        <CardContent>
          <Skeleton variant="text" width="50%" height={28} />
          <Skeleton variant="text" width="35%" />
          <Skeleton variant="rectangular" height={80} sx={{ mt: 2, borderRadius: 1 }} />
        </CardContent>
      </Card>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {[1, 2, 3].map((i) => (
          <Card key={i} variant="outlined" sx={{ flex: 1 }}>
            <CardContent>
              <Skeleton variant="text" width={80} />
              <Skeleton variant="text" width={120} height={28} />
              <Skeleton variant="text" width={160} />
            </CardContent>
          </Card>
        ))}
      </Stack>
      {[1, 2, 3].map((i) => (
        <Card key={i} variant="outlined">
          <CardContent>
            <Skeleton variant="text" width={120} height={32} />
            <Skeleton variant="rectangular" height={60} sx={{ mt: 1, borderRadius: 1 }} />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
