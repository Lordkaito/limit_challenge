'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Suspense, useCallback, useEffect } from 'react';
import { useToast } from '@/app/providers';
import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { useSubmissionFilters } from '@/lib/hooks/useSubmissionFilters';
import { SubmissionFilters } from '@/components/submissions/list/SubmissionFilters';
import { SubmissionTable } from '@/components/submissions/list/SubmissionTable';
import { SubmissionCard } from '@/components/submissions/list/SubmissionCard';
import { SubmissionPagination } from '@/components/submissions/list/SubmissionPagination';

function SubmissionsPageContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    filters,
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

  const submissions = submissionsQuery.data?.results ?? [];
  const totalCount = submissionsQuery.data?.count ?? 0;
  const totalPages = submissionsQuery.data?.totalPages ?? 1;
  const currentPage = filters.page ?? 1;
  const currentPageSize = filters.pageSize ?? 10;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Submissions
          </Typography>
          <Typography color="text.secondary">Review broker-submitted opportunities</Typography>
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
            brokers={brokerQuery.data ?? []}
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
                submissions.map((sub) => <SubmissionCard key={sub.id} submission={sub} />)
              )}
            </Stack>
          ) : (
            <SubmissionTable
              submissions={submissions}
              isLoading={submissionsQuery.isLoading}
              isError={submissionsQuery.isError}
              hasActiveFilters={hasActiveFilters}
              onClear={clearAll}
              onRetry={() => submissionsQuery.refetch()}
              ordering={filters.ordering}
              onSort={handleSort}
            />
          )}

          {!submissionsQuery.isLoading && totalCount > 0 && (
            <>
              <Divider />
              <Box px={2} pb={2}>
                <SubmissionPagination
                  page={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={currentPageSize}
                  onPageChange={(p) => updateParams({ page: String(p) })}
                  onPageSizeChange={(s) => updateParams({ pageSize: String(s), page: '1' })}
                />
              </Box>
            </>
          )}
        </Card>
      </Stack>
    </Container>
  );
}

export default function SubmissionsPage() {
  return (
    <Suspense>
      <SubmissionsPageContent />
    </Suspense>
  );
}
