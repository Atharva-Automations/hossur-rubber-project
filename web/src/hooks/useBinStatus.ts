import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useBinStatus = () =>
  useQuery({
    queryKey: ['bin-status'],
    queryFn: async () => {
      const res = await api.get('/bins/status');
      return res.data;
    },
    refetchInterval: 5000, // optional for real-time refresh
  });
