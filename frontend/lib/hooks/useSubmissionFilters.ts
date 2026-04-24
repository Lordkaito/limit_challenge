'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { SubmissionListFilters, SubmissionPriority, SubmissionStatus } from '@/lib/types';
import { useDebounce } from './useDebounce';

export function useSubmissionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [companyDraft, setCompanyDraft] = useState(searchParams.get('companySearch') ?? '');
  const debouncedCompany = useDebounce(companyDraft, 300);

  const filters: SubmissionListFilters = useMemo(
    () => ({
      status: (searchParams.get('status') as SubmissionStatus) || undefined,
      priority: (searchParams.get('priority') as SubmissionPriority) || undefined,
      brokerId: searchParams.get('brokerId') || undefined,
      companySearch: searchParams.get('companySearch') || undefined,
      createdFrom: searchParams.get('createdFrom') || undefined,
      createdTo: searchParams.get('createdTo') || undefined,
      hasDocuments: searchParams.get('hasDocuments') || undefined,
      hasNotes: searchParams.get('hasNotes') || undefined,
      page: Number(searchParams.get('page') ?? '1'),
      pageSize: Number(searchParams.get('pageSize') ?? '10'),
      ordering: searchParams.get('ordering') || undefined,
    }),
    [searchParams],
  );

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      if (!('page' in updates)) params.delete('page');
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  useEffect(() => {
    const current = searchParams.get('companySearch') ?? '';
    if (debouncedCompany !== current) {
      updateParams({ companySearch: debouncedCompany || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCompany]);

  const clearAll = useCallback(() => {
    setCompanyDraft('');
    router.replace('?', { scroll: false });
  }, [router]);

  const hasActiveFilters = Boolean(
    filters.status ||
    filters.priority ||
    filters.brokerId ||
    filters.companySearch ||
    filters.createdFrom ||
    filters.createdTo ||
    filters.hasDocuments ||
    filters.hasNotes,
  );

  const dateRangeInvalid = Boolean(
    filters.createdFrom && filters.createdTo && filters.createdFrom > filters.createdTo,
  );

  return {
    filters,
    companyDraft,
    setCompanyDraft,
    updateParams,
    clearAll,
    hasActiveFilters,
    dateRangeInvalid,
  };
}
