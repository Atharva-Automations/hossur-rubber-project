'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ExecutionItem, RecipeOption } from '../types/execution';

export const EXECUTION_QUERY_KEYS = {
  all: ['weighing-executions'] as const,
  list: ['weighing-executions', 'list'] as const,
};

export function useExecution() {
  const { data: recipes = [] } = useQuery<RecipeOption[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      const res = await api.get('/recipes');

      return res.data.map((recipe: any) => ({
        id: recipe.id.toString(),
        name: recipe.name,
        ingredients: recipe.steps.flatMap((step: any) =>
          step.ingredients.map((item: any) => ({
            ingredientCode: item.ingredient.name,
            quantity: item.quantity,
          }))
        ),
      }));
    },
  });

  const { data: executions = [] } = useQuery<ExecutionItem[]>({
    queryKey: EXECUTION_QUERY_KEYS.list,
    queryFn: async () => {
      const res = await api.get('/weighing/executions');

      return res.data.map((item: any) => ({
        id: item.id.toString(),
        executionNumber: item.executionCode,
        recipeName: item.recipeName,
        batchCount: item.totalBatches,
        status: item.status,
      }));
    },
  });

  return {
    recipes,
    executions,
  };
}

export function useCreateExecution() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      recipeId: number;
      totalBatches: number;
      mode: 'BULK';
    }) => {
      return api.post('/executions', payload);
    },

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: EXECUTION_QUERY_KEYS.all,
      });
    },
  });
}
