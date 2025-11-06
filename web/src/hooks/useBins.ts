import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useBins = () =>
  useQuery({
    queryKey: ['available-bins'],
    queryFn: async () => {
      const res = await api.get('/bins/available');
      return res.data; // this will be ["B1","B2",...]
    },
  });
