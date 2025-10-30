'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface InwardAnalyticsData {
  totalMaterials: number;
  active: number;
  expired: number;
  topSuppliers: { supplier: string; qty: number }[];
}

export function useInwardAnalytics() {
  return useQuery<InwardAnalyticsData>({
    queryKey: ['inwardAnalytics'],
    queryFn: async () => {
      const res = await api.get('/inward/analytics');
      return res.data;
    },
  });
}
