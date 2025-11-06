import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

export const useAssignBin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      binNumber: string;
      ingredientId: number;
      minQuantity: number;
      maxQuantity: number;
    }) => {
      const res = await api.post('/bins/assign', data);
      return res.data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Bin assigned successfully!',
      });
      // Refresh the bins & ingredients data
      queryClient.invalidateQueries({ queryKey: ['bins'] });
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-ingredients'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to assign bin. Try again.',
        variant: 'destructive',
      });
    },
  });
};
