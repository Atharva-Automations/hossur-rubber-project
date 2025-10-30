'use client';

import { useQuery } from '@tanstack/react-query'; // ✅ add this import
import api from '@/lib/api';

export function useInwardData(filters?: {
  search?: string;
  status?: string;
  sort?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['inward', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.sort) params.append('sort', filters.sort);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get(`/inward${queryString}`);
      return res.data;
    },
  });
}
