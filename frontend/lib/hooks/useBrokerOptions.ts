'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Broker } from '@/lib/types';

export function useBrokerOptions() {
  return useQuery({
    queryKey: ['brokers'],
    queryFn: async () => {
      const res = await apiClient.get<Broker[]>('/brokers/');
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
}
