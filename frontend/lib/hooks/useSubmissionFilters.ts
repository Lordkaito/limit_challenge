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

  const [searchDraft, setSearchDraft] = useState(searchParams.get('search') ?? '');
  const debouncedSearch = useDebounce(searchDraft, 300);

  const filters: SubmissionListFilters = useMemo(
    () => ({
      status: (searchParams.get('status') as SubmissionStatus) || undefined,
      priority: (searchParams.get('priority') as SubmissionPriority) || undefined,
      brokerId: searchParams.get('brokerId') || undefined,
      search: searchParams.get('search') || undefined,
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
    // Same intentional omission as the search effect below — see that comment.
    // searchParams and updateParams are intentionally omitted from the dep array.
    // Adding them would cause the effect to fire on every URL change (e.g. browser
    // back), at which point debouncedCompany still holds the typed value and the
    // effect would re-write it, fighting the navigation. We only want this to run
    // when the user finishes typing. When debouncedCompany changes, React re-renders
    // with the current searchParams before running the effect, so updateParams is
    // always fresh at the moment it executes — there is no actual stale closure risk.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCompany]);

  useEffect(() => {
    const current = searchParams.get('search') ?? '';
    if (debouncedSearch !== current) {
      updateParams({ search: debouncedSearch || undefined });
    }
    // searchParams and updateParams are intentionally omitted from the dep array.
    // Adding them would cause the effect to fire on every URL change (e.g. browser
    // back), at which point debouncedSearch still holds the typed value and the
    // effect would re-write it, fighting the navigation. We only want this to run
    // when the user finishes typing. When debouncedSearch changes, React re-renders
    // with the current searchParams before running the effect, so updateParams is
    // always fresh at the moment it executes — there is no actual stale closure risk.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const clearAll = useCallback(() => {
    setCompanyDraft('');
    setSearchDraft('');
    router.replace('?', { scroll: false });
  }, [router]);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.status ||
          filters.priority ||
          filters.brokerId ||
          filters.search ||
          filters.companySearch ||
          filters.createdFrom ||
          filters.createdTo ||
          filters.hasDocuments ||
          filters.hasNotes,
      ),
    [filters],
  );

  const dateRangeInvalid = useMemo(
    () =>
      Boolean(
        filters.createdFrom && filters.createdTo && filters.createdFrom > filters.createdTo,
      ),
    [filters],
  );

  const backQs = useMemo(() => searchParams.toString(), [searchParams]);

  return {
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
  };
}
