'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useInwardData() {
  return useQuery({
    queryKey: ['inward'],
    queryFn: async () => {
      const res = await api.get('/inward');
      return res.data;
    },
  });
}

export function useCreateInward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/inward', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inward'] }),
  });
}

export function useDeleteInward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/inward/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inward'] }),
  });
}
