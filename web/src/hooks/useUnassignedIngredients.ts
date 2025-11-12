import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { IngredientOption } from '@/types/data';

export const useUnassignedIngredients = () =>
  useQuery<IngredientOption[]>({
    queryKey: ['unassigned-ingredients'],
    queryFn: async () => {
      const res = await api.get('/bins/unassigned-ingredients');
      return res.data;
    },
  });
