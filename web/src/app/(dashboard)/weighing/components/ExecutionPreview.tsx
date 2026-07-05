'use client';

import { Card, CardContent, CardHeader } from '@/components/global';
import { RecipeOption } from '../types/execution';

interface ExecutionPreviewProps {
  recipe: RecipeOption | null;
  batchCount: number;
}

export function ExecutionPreview({
  recipe,
  batchCount,
}: ExecutionPreviewProps) {
  const safeBatchCount =
    Number.isFinite(batchCount) && batchCount > 0 ? batchCount : 1;

  const totalIngredients =
    recipe?.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity: ingredient.quantity * safeBatchCount,
    })) ?? [];

  return (
    <Card className="border border-gray-200 bg-gray-50/70">
      <CardHeader>
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Live Preview
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            The requirement summary updates automatically as you change the
            recipe or batch count.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr]">
          <div className="space-y-4 rounded-3xl border border-gray-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recipe</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {recipe?.name ?? 'Select a recipe'}
                </p>
              </div>
              <div className="rounded-2xl bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200">
                {safeBatchCount} batch{safeBatchCount === 1 ? '' : 'es'}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">
                  Batch Recipe
                </h4>
                <span className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                  Per batch
                </span>
              </div>
              <div className="space-y-3">
                {recipe?.ingredients.length ? (
                  recipe.ingredients.map((ingredient, index) => (
                    <div
                      key={`batch-${ingredient.ingredientCode}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {ingredient.ingredientCode}
                      </span>
                      <span className="text-sm text-gray-600">
                        {ingredient.quantity.toLocaleString()} g
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No ingredients available for this recipe.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-gray-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overall Requirement</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  Total requirement
                </p>
              </div>
              <div className="rounded-2xl bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200">
                {safeBatchCount}x
              </div>
            </div>

            <div className="space-y-3">
              {totalIngredients.length ? (
                totalIngredients.map((ingredient, index) => (
                  <div
                    key={`total-${ingredient.ingredientCode}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {ingredient.ingredientCode}
                    </span>
                    <span className="text-sm text-gray-600">
                      {ingredient.quantity.toLocaleString()} g
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Select a recipe to calculate the overall requirement.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
