import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useUnassignedIngredients = () =>
  useQuery({
    queryKey: ['unassigned-ingredients'],
    queryFn: async () => {
      const res = await api.get('/bins/unassigned-ingredients');
      return res.data;
    },
  });
