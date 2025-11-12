import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

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
    },
  });
}
