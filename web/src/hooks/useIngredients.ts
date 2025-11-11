import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export type IngredientOption = {
  id: number;
  ingredientCode: string;
  name?: string | null;
};

export function useIngredients() {
  return useQuery<IngredientOption[]>({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const res = await api.get('/ingredients'); // make sure your controller returns a list
      return res.data;
    },
  });
}
