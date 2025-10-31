'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useMaterials() {
  return useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data } = await api.get<string[]>('/inward/materials');
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000, // cache for 5 min
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data } = await api.get<string[]>('/inward/suppliers');
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
