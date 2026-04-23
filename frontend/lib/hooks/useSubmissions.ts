'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import {
  PaginatedResponse,
  SubmissionDetail,
  SubmissionListFilters,
  SubmissionListItem,
} from '@/lib/types';
import { buildParams } from '@/lib/utils/params';

export function useSubmissionsList(filters: SubmissionListFilters) {
  return useQuery({
    queryKey: ['submissions', 'list', filters],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<SubmissionListItem>>(
        '/submissions/',
        { params: buildParams(filters as Record<string, unknown>) }
      );
      return res.data;
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
    enabled: true,
  });
}

export function useSubmissionDetail(id: string | number) {
  return useQuery({
    queryKey: ['submissions', 'detail', id],
    queryFn: async () => {
      const res = await apiClient.get<SubmissionDetail>(`/submissions/${id}/`);
      return res.data;
    },
    staleTime: 60_000,
    enabled: Boolean(id),
  });
}
