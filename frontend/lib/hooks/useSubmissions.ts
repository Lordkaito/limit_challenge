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
      const res = await apiClient.get<PaginatedResponse<SubmissionListItem>>('/submissions/', {
        params: buildParams(filters as Record<string, unknown>),
      });
      return res.data;
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
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

export function useSubmissionStats() {
  return useQuery({
    queryKey: ['submissions', 'stats', 'high-priority-new'],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<SubmissionListItem>>('/submissions/', {
        params: { priority: 'high', status: 'new', pageSize: 1 },
      });
      return res.data.count;
    },
    staleTime: 60_000,
  });
}
