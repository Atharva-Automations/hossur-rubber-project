import api from '@/lib/api';
import { Outward, OutwardFilters } from '@/types/outward';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifyGlobal } from '@/components/notifications/ToastProvider';

export function useOutwardList() {
  return useQuery({
    queryKey: ['outward'],
    queryFn: async () => {
      const res = await api.get('/outward');
      return res.data || [];
    },
  });
}

export function useCreateOutward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/outward', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outward'] });
      qc.invalidateQueries({ queryKey: ['materialStock'] });
      notifyGlobal({
        type: 'success',
        message: 'Outward created successfully',
      });
    },
    onError: () => {
      notifyGlobal({ type: 'error', message: 'Failed to create outward' });
    },
  });
}

export function useDeleteOutward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/outward/${id}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outward'] });
      notifyGlobal({
        type: 'success',
        message: 'Outward deleted successfully',
      });
    },
    onError: () => {
      notifyGlobal({ type: 'error', message: 'Failed to delete outward' });
    },
  });
}

export function useOutwardAnalytics() {
  return useQuery({
    queryKey: ['outwardAnalytics'],
    queryFn: async () => {
      const res = await api.get('/outward/analytics');
      return res.data;
    },
  });
}

export function useOutwardData(filters?: OutwardFilters) {
  return useQuery<Outward[]>({
    queryKey: ['outward', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.search) params.append('search', filters.search);
      if (filters?.status && filters.status !== 'All')
        params.append('status', filters.status);
      if (filters?.sort) params.append('sort', filters.sort);

      const res = await api.get(`/outward?${params.toString()}`);
      return res.data;
    },
  });
}
