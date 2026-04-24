'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Suspense, useCallback, useEffect } from 'react';
import { useToast } from '@/app/providers';
import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSubmissionsList, useSubmissionStats } from '@/lib/hooks/useSubmissions';
import { useSubmissionFilters } from '@/lib/hooks/useSubmissionFilters';
import { SubmissionFilters } from '@/components/submissions/list/SubmissionFilters';
import { SubmissionTable } from '@/components/submissions/list/SubmissionTable';
import { SubmissionCard } from '@/components/submissions/list/SubmissionCard';
import { SubmissionPagination } from '@/components/submissions/list/SubmissionPagination';
import type { Broker, SubmissionListItem } from '@/lib/types';

const EMPTY_SUBMISSIONS: SubmissionListItem[] = [];
const EMPTY_BROKERS: Broker[] = [];

function SubmissionsPageContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    filters,
    backQs,
    companyDraft,
    setCompanyDraft,
    searchDraft,
    setSearchDraft,
    updateParams,
    clearAll,
    hasActiveFilters,
    dateRangeInvalid,
  } = useSubmissionFilters();

  const handleSort = useCallback(
    (field: string) => {
      const next = filters.ordering === `-${field}` ? field : `-${field}`;
      updateParams({ ordering: next });
    },
    [filters.ordering, updateParams],
  );

  const { showError } = useToast();

  const submissionsQuery = useSubmissionsList(filters);
  const brokerQuery = useBrokerOptions();
  const statsQuery = useSubmissionStats();
  const urgentCount = statsQuery.data ?? 0;

  useEffect(() => {
    if (submissionsQuery.isError) {
      showError('Failed to load submissions. Please try again.');
    }
  }, [submissionsQuery.isError, showError]);

  useEffect(() => {
    if (brokerQuery.isError) {
      showError('Failed to load broker list. Please try again.');
    }
  }, [brokerQuery.isError, showError]);

  const submissions = submissionsQuery.data?.results ?? EMPTY_SUBMISSIONS;
  const totalCount = submissionsQuery.data?.count ?? 0;
  const totalPages = submissionsQuery.data?.totalPages ?? 1;
  const currentPage = filters.page ?? 1;
  const currentPageSize = filters.pageSize ?? 10;

  const onRetry = useCallback(() => submissionsQuery.refetch(), [submissionsQuery]);
  const onPageChange = useCallback(
    (p: number) => updateParams({ page: String(p) }),
    [updateParams],
  );
  const onPageSizeChange = useCallback(
    (s: number) => updateParams({ pageSize: String(s), page: '1' }),
    [updateParams],
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700}>
                Submissions
              </Typography>
              <Typography color="text.secondary">Review broker-submitted opportunities</Typography>
            </Box>
            {(totalCount > 0 || urgentCount > 0) && (
              <Stack direction="row" spacing={1} alignItems="center" pt={0.5}>
                {totalCount > 0 && (
                  <Chip label={`${totalCount} total`} size="small" variant="outlined" />
                )}
                {urgentCount > 0 && (
                  <Chip
                    label={`${urgentCount} urgent`}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )}
              </Stack>
            )}
          </Stack>
        </Box>

        <Card variant="outlined" sx={{ p: 2 }}>
          <SubmissionFilters
            status={filters.status}
            priority={filters.priority}
            brokerId={filters.brokerId}
            searchDraft={searchDraft}
            companyDraft={companyDraft}
            createdFrom={filters.createdFrom}
            createdTo={filters.createdTo}
            hasDocuments={filters.hasDocuments}
            hasNotes={filters.hasNotes}
            dateRangeInvalid={dateRangeInvalid}
            hasActiveFilters={hasActiveFilters}
            brokers={brokerQuery.data ?? EMPTY_BROKERS}
            brokersLoading={brokerQuery.isLoading}
            onUpdate={updateParams}
            onSearchDraftChange={setSearchDraft}
            onCompanyDraftChange={setCompanyDraft}
            onClear={clearAll}
            totalCount={submissionsQuery.isFetching ? undefined : totalCount}
          />
        </Card>

        <Card variant="outlined">
          {isMobile ? (
            <Stack spacing={2} p={2}>
              {submissions.length === 0 && !submissionsQuery.isLoading ? (
                <Box textAlign="center" py={6}>
                  <Typography color="text.secondary">
                    {hasActiveFilters
                      ? 'No submissions match the active filters.'
                      : 'No submissions yet.'}
                  </Typography>
                </Box>
              ) : (
                submissions.map((sub) => (
                  <SubmissionCard key={sub.id} submission={sub} backQs={backQs} />
                ))
              )}
            </Stack>
          ) : (
            <SubmissionTable
              submissions={submissions}
              isLoading={submissionsQuery.isLoading}
              isError={submissionsQuery.isError}
              hasActiveFilters={hasActiveFilters}
              onClear={clearAll}
              onRetry={onRetry}
              ordering={filters.ordering}
              onSort={handleSort}
              pageSize={currentPageSize}
              backQs={backQs}
            />
          )}

          {!submissionsQuery.isLoading && !submissionsQuery.isError && (
            <>
              <Divider />
              <Box px={2} pb={2}>
                <SubmissionPagination
                  page={currentPage}
                  totalPages={totalPages}
                  pageSize={currentPageSize}
                  onPageChange={onPageChange}
                  onPageSizeChange={onPageSizeChange}
                />
              </Box>
            </>
          )}
        </Card>
      </Stack>
    </Container>
  );
}

function SubmissionsPageSkeleton() {
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

export default function SubmissionsPage() {
  return (
    <Suspense fallback={<SubmissionsPageSkeleton />}>
      <SubmissionsPageContent />
    </Suspense>
  );
}
