'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';
import { StatusChip } from '@/components/common/StatusChip';
import { PriorityChip } from '@/components/common/PriorityChip';
import { ContactsSection } from '@/components/submissions/detail/ContactsSection';
import { DocumentsSection } from '@/components/submissions/detail/DocumentsSection';
import { NotesSection } from '@/components/submissions/detail/NotesSection';
import { DetailSkeleton } from '@/components/submissions/detail/DetailSkeleton';
import { formatDateTime } from '@/lib/utils/formatters';

function SubmissionDetailContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const submissionId = params?.id ?? '';

  const { data, isLoading, isError, error, refetch } = useSubmissionDetail(submissionId);

  const backHref = `/submissions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Button
            component={Link}
            href={backHref}
            startIcon={<ArrowBackIcon />}
            variant="text"
            color="inherit"
            size="small"
            sx={{ mb: 1 }}
          >
            Back to queue
          </Button>
        </Box>

        {isLoading && <DetailSkeleton />}

        {isError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            {(error as Error)?.message ?? 'Failed to load submission.'}
          </Alert>
        )}

        {data && (
          <>
            <Box
              display="flex"
              alignItems="flex-start"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={2}
            >
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {data.company.legalName}
                </Typography>
                <Typography color="text.secondary">
                  {data.company.industry}
                  {data.company.headquartersCity ? ` · ${data.company.headquartersCity}` : ''}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <StatusChip status={data.status} size="medium" />
                <PriorityChip priority={data.priority} size="medium" />
              </Stack>
            </Box>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Summary
                </Typography>
                {data.summary ? (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {data.summary}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.disabled" fontStyle="italic">
                    No summary provided
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary" display="block">
                      Broker
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {data.broker.name}
                    </Typography>
                    {data.broker.primaryContactEmail && (
                      <Typography variant="body2" color="text.secondary">
                        {data.broker.primaryContactEmail}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary" display="block">
                      Owner
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {data.owner.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {data.owner.email}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary" display="block">
                      Timeline
                    </Typography>
                    <Tooltip title={formatDateTime(data.createdAt)} placement="top">
                      <Typography variant="body2" fontWeight={500}>
                        Created {formatDateTime(data.createdAt)}
                      </Typography>
                    </Tooltip>
                    <Typography variant="body2" color="text.secondary">
                      Updated {formatDateTime(data.updatedAt)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <ContactsSection contacts={data.contacts} />
            <DocumentsSection documents={data.documents} />
            <NotesSection notes={data.notes} />
          </>
        )}
      </Stack>
    </Container>
  );
}

export default function SubmissionDetailPage() {
  return (
    <Suspense>
      <SubmissionDetailContent />
    </Suspense>
  );
}
