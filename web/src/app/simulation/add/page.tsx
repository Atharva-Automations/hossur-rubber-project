// web/src/app/simulation/add/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

// ---- Minimal types (adjust if backend differs) ----
type Recipe = {
  id: number;
  recipeCode: string;
  name: string;
  steps?: {
    id: number;
    stepType: 'KNEADER' | 'MIXING';
    sequenceNumber: number;
    timerSeconds: number;
    ingredients: {
      id: number;
      ingredientId: number;
      ingredientCode: string;
      quantity: number; // per single execution
      unit: string;
    }[];
  }[];
};

type BatchCreateVars = {
  recipeId: number;
  quantity: number;
  enableKneader: boolean;
  enableMixing: boolean;
};

// ---- Helpers ----
function normalizeStepIngredient(i: any, qtyMultiplier = 1) {
  // tolerant: accept either i.ingredientCode (flat) OR i.ingredient.ingredientCode (nested)
  const code =
    i.ingredientCode ??
    i.ingredient?.ingredientCode ??
    i.ingredient?.ingredient_code ??
    '—';
  const name = i.name ?? i.ingredient?.name ?? i.ingredientName ?? code ?? '—';
  const perExecution = Number(i.quantity ?? 0);
  const unit = i.unit ?? i.ingredient?.unit ?? 'KG';

  return {
    id: i.id,
    code,
    name,
    perExecution,
    unit,
    totalForBatch: perExecution * qtyMultiplier,
  };
}

function computePreview(
  recipe: Recipe,
  qty: number,
  enableKneader: boolean,
  enableMixing: boolean
) {
  const steps = (recipe.steps || [])
    .filter(
      (s) =>
        (s.stepType === 'KNEADER' && enableKneader) ||
        (s.stepType === 'MIXING' && enableMixing)
    )
    .slice()
    .sort((a, b) => {
      // keep relative order per step type; kneader first if present
      if (a.stepType === b.stepType) return a.sequenceNumber - b.sequenceNumber;
      return a.stepType === 'KNEADER' ? -1 : 1;
    });

  const stepView = steps.map((s) => ({
    id: s.id,
    stepType: s.stepType,
    sequenceNumber: s.sequenceNumber,
    timerSeconds: s.timerSeconds,
    ingredients: s.ingredients.map((ing: any) =>
      normalizeStepIngredient(ing, qty)
    ),
  }));

  const agg = new Map<string, { code: string; total: number; unit?: string }>();
  stepView.forEach((s) => {
    s.ingredients.forEach((i) => {
      const prev = agg.get(i.code);
      if (!prev)
        agg.set(i.code, { code: i.code, total: i.totalForBatch, unit: i.unit });
      else prev.total += i.totalForBatch;
    });
  });

  return {
    steps: stepView,
    aggregated: Array.from(agg.values()),
    totalTimeSeconds: steps.reduce((a, b) => a + (b.timerSeconds || 0), 0),
  };
}

// ---- Page component ----
export default function SimulationAddPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: recipes = [], isPending: loadingRecipes } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => (await api.get('/recipes')).data,
  });

  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [batchQty, setBatchQty] = useState<number>(1);
  const [enableKneader, setEnableKneader] = useState(true);
  const [enableMixing, setEnableMixing] = useState(true);

  const selectedRecipe = useMemo(
    () => recipes.find((r) => r.id === selectedRecipeId) || null,
    [recipes, selectedRecipeId]
  );
  const preview = useMemo(
    () =>
      selectedRecipe
        ? computePreview(
            selectedRecipe,
            batchQty || 1,
            enableKneader,
            enableMixing
          )
        : null,
    [selectedRecipe, batchQty, enableKneader, enableMixing]
  );

  // Create batch mutation
  const createBatch = useMutation({
    mutationFn: (vars: BatchCreateVars) => api.post('/batch', vars),
    onSuccess: (res: any) => {
      const created = res.data || res;
      toast({
        title: 'Batch created',
        description: `Batch ${created.id || created} created.`,
      });
      qc.invalidateQueries({ queryKey: ['batches'] });
      // go back to main simulation overview page where batches list lives
      router.push('/simulation');
    },
    onError: (err: any) => {
      toast({
        title: 'Create failed',
        description: err?.response?.data?.message || 'Failed to create batch',
        variant: 'destructive',
      });
    },
  });

  const handleSave = async () => {
    if (!selectedRecipe) {
      toast({
        title: 'Choose a recipe',
        description: 'Select a recipe before saving.',
        variant: 'destructive',
      });
      return;
    }
    if (!batchQty || batchQty <= 0) {
      toast({
        title: 'Invalid quantity',
        description: 'Batch quantity must be >= 1',
        variant: 'destructive',
      });
      return;
    }

    await createBatch.mutateAsync({
      recipeId: selectedRecipe.id,
      quantity: batchQty,
      enableKneader,
      enableMixing,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create Batch</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Recipe</Label>
              <Select
                value={selectedRecipeId?.toString() || ''}
                onValueChange={(v) => setSelectedRecipeId(v ? Number(v) : null)}
              >
                <SelectTrigger className="bg-white mt-1">
                  <SelectValue
                    placeholder={
                      loadingRecipes ? 'Loading...' : 'Select recipe'
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-60 overflow-y-auto">
                  {recipes.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.recipeCode} — {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Batch Quantity</Label>
              <Input
                type="number"
                min={1}
                value={batchQty}
                onChange={(e) => setBatchQty(Number(e.target.value || 0))}
              />
            </div>

            <div>
              <Label>Modules</Label>
              <div className="flex gap-2 mt-1">
                <button
                  className={`px-3 py-1 rounded ${
                    enableKneader ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}
                  onClick={() => setEnableKneader((s) => !s)}
                >
                  Kneader
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    enableMixing ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}
                  onClick={() => setEnableMixing((s) => !s)}
                >
                  Mixer
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/simulation')}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={createBatch.isPending}>
              {createBatch.isPending ? 'Saving...' : 'Save & Create Batch'}
            </Button>
          </div>
        </Card>

        {/* Quick Preview (visible when a recipe is selected) */}
        {preview && selectedRecipe && (
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">Quick Preview</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <div>
                    <b>Recipe:</b> {selectedRecipe.recipeCode} —{' '}
                    {selectedRecipe.name}
                  </div>
                  <div>
                    <b>Batch qty:</b> {batchQty}
                  </div>
                  <div>
                    <b>Total time (sum timers):</b> {preview.totalTimeSeconds}s
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">Preview updates live</div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <div className="font-medium mb-2">Steps</div>
                <div className="space-y-2">
                  {preview.steps.map((s) => (
                    <div key={s.id} className="border rounded p-3">
                      <div className="flex justify-between">
                        <div>
                          <b>{s.stepType}</b> — seq {s.sequenceNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {s.timerSeconds}s
                        </div>
                      </div>
                      <ul className="text-sm mt-2">
                        {s.ingredients.map((i) => (
                          <li key={i.id}>
                            <span className="font-medium">{i.code}</span> —{' '}
                            {i.perExecution} each — <b>{i.totalForBatch}</b>{' '}
                            {i.unit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">Aggregated Ingredients</div>
                <div className="space-y-2">
                  {preview.aggregated.map((a) => (
                    <div key={a.code} className="p-2 border rounded text-sm">
                      {a.code} — <b>{a.total}</b> {a.unit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
