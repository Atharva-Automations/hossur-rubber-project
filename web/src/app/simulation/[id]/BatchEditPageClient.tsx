'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

type RecipeMinimal = {
  id: number;
  recipeCode: string;
  name: string;
  steps?: any[];
};

export default function BatchEditPageClient({ batchId }: { batchId: number }) {
  const qc = useQueryClient();
  // console.log('updateBatch dto:', dto);
  // ---------- TOP-LEVEL hooks (unconditional) ----------
  // fetch recipes for dropdown (endpoint may be '/recipe' in your backend — adjust if needed)
  const { data: recipes = [], isLoading: loadingRecipes } = useQuery<
    RecipeMinimal[]
  >({
    queryKey: ['recipes'],
    queryFn: async () => (await api.get('/recipes')).data,
  });

  // fetch batch details (enabled only when batchId is valid)
  const {
    data: batchData,
    isLoading: loadingBatch,
    isFetching: fetchingBatch,
  } = useQuery({
    queryKey: ['batch', batchId],
    queryFn: async () => (await api.get(`/batch/${batchId}`)).data,
    enabled: !!batchId,
  });

  // local editable state (always declared at top)
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [batchQty, setBatchQty] = useState<number>(1);

  // toggles
  const [enableKneader, setEnableKneader] = useState<boolean>(true);
  const [enableMixing, setEnableMixing] = useState<boolean>(true);

  // original snapshot for change detection
  const [original, setOriginal] = useState<{
    recipeId?: number;
    quantity?: number;
    enableKneader?: boolean;
    enableMixing?: boolean;
  } | null>(null);

  // mutation to update batch
  // NOTE: mutationFn takes the clean payload directly (we'll call mutateAsync(payload))
  const updateBatchMut = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put(`/batch/${batchId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast({
        title: 'Batch updated',
        description: `Batch ${batchId} updated.`,
      });
      qc.invalidateQueries({ queryKey: ['batch', batchId] });
      qc.invalidateQueries({ queryKey: ['batches'] });
      // refresh original snapshot to current UI values
      setOriginal({
        recipeId: selectedRecipeId ?? undefined,
        quantity: batchQty,
        enableKneader,
        enableMixing,
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Update failed',
        description: err?.response?.data?.message || 'Failed to update',
        variant: 'destructive',
      });
    },
  });

  // populate local state when batchData is loaded
  useEffect(() => {
    if (!batchData) return;

    // Determine steps array: batch may include steps or include recipe with steps
    const steps = Array.isArray(batchData.steps)
      ? batchData.steps
      : Array.isArray(batchData.recipe?.steps)
      ? batchData.recipe.steps
      : [];

    const hasKneader = steps.some(
      (s: any) => String(s.stepType).toUpperCase() === 'KNEADER'
    );
    const hasMixing = steps.some(
      (s: any) => String(s.stepType).toUpperCase() === 'MIXING'
    );

    setSelectedRecipeId(batchData.recipeId ?? batchData.recipe?.id ?? null);
    setBatchQty(Number(batchData.quantity ?? 1));
    setEnableKneader(hasKneader);
    setEnableMixing(hasMixing);

    setOriginal({
      recipeId: batchData.recipeId ?? batchData.recipe?.id,
      quantity: Number(batchData.quantity ?? 1),
      enableKneader: hasKneader,
      enableMixing: hasMixing,
    });
  }, [batchData]);

  // --- preview calculation (derived) ---
  const selectedRecipe = useMemo(() => {
    return (
      recipes.find((r) => r.id === selectedRecipeId) ??
      batchData?.recipe ??
      null
    );
  }, [recipes, selectedRecipeId, batchData]);

  const preview = useMemo(() => {
    if (!selectedRecipe) return { totalTime: 0, steps: [], aggregated: [] };

    const steps = (selectedRecipe.steps || [])
      .filter(
        (s: any) =>
          (s.stepType === 'KNEADER' && enableKneader) ||
          (s.stepType === 'MIXING' && enableMixing)
      )
      .slice()
      .sort((a: any, b: any) => {
        if (a.stepType === b.stepType)
          return a.sequenceNumber - b.sequenceNumber;
        if (a.stepType === 'KNEADER') return -1;
        return 1;
      });

    let totalTime = 0;
    const agg: Record<string, { code: string; total: number; unit: string }> =
      {};

    steps.forEach((s: any) => {
      totalTime += Number(s.timerSeconds || 0);
      (s.ingredients || []).forEach((ing: any) => {
        const code =
          ing.ingredient?.ingredientCode ??
          ing.ingredientCode ??
          ing.ingredientCode ??
          '—';
        const unit = ing.unit || 'KG';
        const qtyPerUnit = Number(ing.quantity || 0);
        const totalForBatch = qtyPerUnit * batchQty;
        if (!agg[code]) agg[code] = { code, total: 0, unit };
        agg[code].total += totalForBatch;
      });
    });

    return {
      totalTime,
      steps,
      aggregated: Object.values(agg),
    };
  }, [selectedRecipe, enableKneader, enableMixing, batchQty]);

  // detect if local changes exist compared to original snapshot
  const hasChanges = useMemo(() => {
    if (!original) return false;
    return (
      original.recipeId !== selectedRecipeId ||
      original.quantity !== batchQty ||
      original.enableKneader !== enableKneader ||
      original.enableMixing !== enableMixing
    );
  }, [original, selectedRecipeId, batchQty, enableKneader, enableMixing]);

  // helper: build clean payload expected by backend
  function buildBatchUpdatePayload({
    quantity,
    enableKneader,
    enableMixing,
    steps,
  }: {
    quantity: number | string;
    enableKneader: boolean;
    enableMixing: boolean;
    steps: any[];
  }) {
    // quantity must be integer
    const qtyNum = Number(quantity);
    if (!Number.isFinite(qtyNum) || !Number.isInteger(qtyNum)) {
      throw new Error('Quantity must be an integer');
    }

    // Clean steps: remove nested entity objects the DTO doesn't expect.
    // Expect backend wants step objects like { stepType, sequenceNumber, timerSeconds, pressure, temperature, rpm, ingredients: [{ ingredientId, quantity, unit }] }
    const cleanSteps = (steps || []).map((s) => {
      const cleanIng = (s.ingredients || []).map((ing: any) => ({
        // prefer ingredientId; if not present, fallback to ingredient.ingredientId
        ingredientId: ing.ingredientId ?? ing.ingredient?.id ?? undefined,
        quantity: Number(ing.quantity ?? 0),
        unit: ing.unit ?? 'KG',
      }));

      return {
        stepType: s.stepType,
        sequenceNumber: Number(s.sequenceNumber ?? 0),
        timerSeconds: Number(s.timerSeconds ?? 0),
        pressure:
          s.pressure === undefined ? undefined : Number(s.pressure ?? 0),
        temperature:
          s.temperature === undefined ? undefined : Number(s.temperature ?? 0),
        rpm: s.rpm === undefined ? undefined : Number(s.rpm ?? 0),
        ingredients: cleanIng,
      };
    });

    return {
      quantity: qtyNum,
      enableKneader: !!enableKneader,
      enableMixing: !!enableMixing,
      steps: cleanSteps,
    };
  }

  // save changes handler
  const handleSaveChanges = async () => {
    try {
      // determine steps to send: prefer batchData.steps (server-side batch snapshot)
      const stepsToSend = Array.isArray(batchData?.steps)
        ? batchData!.steps
        : Array.isArray(batchData?.recipe?.steps)
        ? batchData!.recipe!.steps
        : [];

      const payload = buildBatchUpdatePayload({
        quantity: batchQty,
        enableKneader,
        enableMixing,
        steps: stepsToSend,
      });

      // IMPORTANT: pass the payload directly to mutateAsync (do NOT wrap in { id, body } or similar)
      await updateBatchMut.mutateAsync(payload);
      toast({ title: 'Batch saved' });
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err?.message || err?.response?.data?.message || 'Error',
        variant: 'destructive',
      });
    }
  };

  // Render
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            View / Edit Batch — {batchId}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Recipe</Label>
              <Select
                value={selectedRecipeId ? String(selectedRecipeId) : ''}
                onValueChange={(v) => setSelectedRecipeId(v ? Number(v) : null)}
              >
                <SelectTrigger className="bg-white mt-1">
                  <SelectValue
                    placeholder={loadingBatch ? 'Loading...' : 'Select recipe'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((r: any) => (
                    <SelectItem key={r.id} value={String(r.id)}>
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
                onChange={(e) => {
                  // coerce to integer (0 if empty)
                  const v = e.target.value;
                  const n = Number(v);
                  setBatchQty(Number.isFinite(n) ? Math.trunc(n) : 0);
                }}
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

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                // navigate back (you can integrate your router)
                // example with window.history:
                window.history.back();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={!hasChanges || updateBatchMut.isPending}
            >
              {updateBatchMut.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Quick Preview</h3>
          <div className="text-sm text-gray-700 mb-3">
            <div>
              <b>Recipe:</b>{' '}
              {selectedRecipe
                ? `${selectedRecipe.recipeCode} — ${selectedRecipe.name}`
                : '—'}
            </div>
            <div>
              <b>Batch qty:</b> {batchQty}
            </div>
            <div>
              <b>Total time (sum timers):</b> {preview.totalTime}s
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {preview.steps.map((s: any) => (
                <div
                  key={s.id ?? `${s.stepType}-${s.sequenceNumber}`}
                  className="border rounded p-3 mb-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">
                      {s.stepType} — seq {s.sequenceNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s.timerSeconds}s
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 mt-2">
                    {(s.ingredients || []).map((ing: any) => {
                      const code =
                        ing.ingredient?.ingredientCode ??
                        ing.ingredientCode ??
                        '—';
                      const per = Number(ing.quantity || 0);
                      const total = per * batchQty;
                      return (
                        <div
                          key={`${s.id ?? 's'}-${ing.id ?? ing.ingredientId}`}
                          className="mt-1"
                        >
                          {code} — {per} each —{' '}
                          <b>
                            {total} {ing.unit}
                          </b>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-2 font-medium">Aggregated Ingredients</div>
              {preview.aggregated.map((a: any) => (
                <div key={a.code} className="border rounded p-2 mb-2">
                  {a.code} —{' '}
                  <b>
                    {a.total} {a.unit}
                  </b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
