import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/recipes', data);
      return res.data;
    },
    onSuccess: () => {
      toast({
        title: 'Recipe Created',
        description: 'The recipe has been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Error Creating Recipe',
        description: err.response?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });
}
