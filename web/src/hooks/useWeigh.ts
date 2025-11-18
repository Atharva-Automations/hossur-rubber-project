// web/src/hooks/useWeigh.ts
import api from '@/lib/api';
import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

type WeighVariables = {
  batchId: number;
  batchStepId: number;
  batchIngredientId: number;
  weight: number;
  label?: string;
};

type WeighResponse = {
  id: number;
  qrId: string;
  weight: number;
  label?: string;
};

export function useWeigh(): UseMutationResult<
  WeighResponse,
  any,
  WeighVariables
> {
  const qc = useQueryClient();

  return useMutation<WeighResponse, any, WeighVariables>({
    // explicit typed mutation function
    mutationFn: async (vars: WeighVariables) => {
      const { batchId, batchStepId, batchIngredientId, weight, label } = vars;
      const res = await api.post(`/batch/${batchId}/weigh`, {
        batchStepId,
        batchIngredientId,
        weight,
        label,
      });
      return res.data as WeighResponse;
    },
    onSuccess: (data) => {
      toast({ title: 'Weighed', description: 'Weighed bag created' });
      // invalidate queries that need refresh
      qc.invalidateQueries({ queryKey: ['batch'] });
      qc.invalidateQueries({ queryKey: ['bin-status'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Weigh error',
        description: err?.response?.data?.message || 'Failed to weigh',
        variant: 'destructive',
      });
    },
  });
}
