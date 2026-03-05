'use client';

import { useState } from 'react';
import { useBins } from '@/hooks/useBins';
import { useAssignBin } from '@/hooks/useAssignBins';
import { useUnassignedIngredients } from '@/hooks/useUnassignedIngredients';
import { Header, PageContainer, Card } from '@/components/global';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

export default function AssignBinPage() {
  const { data: allBins = [] } = useBins();
  const { mutateAsync: assignBin, isPending } = useAssignBin();
  const { data: availableIngredients = [] } = useUnassignedIngredients();

  const [form, setForm] = useState({
    binNumber: '',
    ingredientId: '',
    minQuantity: '',
    maxQuantity: '',
  });

  const [errors, setErrors] = useState<{
    minQuantity?: string;
    maxQuantity?: string;
  }>({});

  const availableBins = (
    allBins as unknown as Array<{ binNumber?: string; ingredientId?: unknown }>
  )
    .filter((b) => !b?.ingredientId && b?.binNumber)
    .map((b) => b?.binNumber || '')
    .filter((b) => b !== ''); // Filter out empty strings

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!form.binNumber || !form.ingredientId) {
      toast({
        title: 'Missing Fields',
        description: 'Please select bin and ingredient.',
        variant: 'destructive',
      });
      return;
    }
    if (!form.minQuantity || Number(form.minQuantity) <= 0)
      newErrors.minQuantity = 'Minimum quantity must be greater than 0.';
    if (
      !form.maxQuantity ||
      Number(form.maxQuantity) <= Number(form.minQuantity)
    )
      newErrors.maxQuantity = 'Max quantity must be greater than Min quantity.';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await assignBin({
        binNumber: form.binNumber,
        ingredientId: Number(form.ingredientId),
        minQuantity: Number(form.minQuantity),
        maxQuantity: Number(form.maxQuantity),
      });

      toast({ title: 'Success', description: 'Bin assigned successfully!' });
      setForm({
        binNumber: '',
        ingredientId: '',
        minQuantity: '',
        maxQuantity: '',
      });
      setErrors({});
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to assign bin.',
        variant: 'destructive',
      });
    }
  };

  return (
    <PageContainer>
      <Header
        title="Assign Bin"
        description="Assign a bin to an ingredient for storage management"
        icon="📊"
      />

      <div className="mt-8 max-w-2xl">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">
            Bin Assignment Details
          </h3>

          {/* Bin Number */}
          <div className="mb-6">
            <Label className="text-gray-900 font-medium">Bin Number</Label>
            <Select
              value={form.binNumber}
              onValueChange={(v) =>
                setForm((prev) => ({ ...prev, binNumber: v }))
              }
            >
              <SelectTrigger className="bg-white border-gray-200 mt-1">
                <SelectValue placeholder="Select Bin" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                {availableBins.length === 0 ? (
                  <SelectItem value="none" disabled>
                    All bins assigned
                  </SelectItem>
                ) : (
                  availableBins.map((b: string) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Ingredient */}
          <div className="mb-6">
            <Label className="text-gray-900 font-medium">
              Select Ingredient
            </Label>
            <Select
              value={form.ingredientId}
              onValueChange={(v) =>
                setForm((prev) => ({ ...prev, ingredientId: v }))
              }
            >
              <SelectTrigger className="bg-white border-gray-200 mt-1">
                <SelectValue placeholder="Select ingredient" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                {availableIngredients.length === 0 ? (
                  <SelectItem value="none" disabled>
                    All ingredients assigned
                  </SelectItem>
                ) : (
                  (
                    availableIngredients as Array<{
                      id: number;
                      ingredientCode?: string;
                      name?: string;
                      materialName?: string;
                    }>
                  ).map((i) => (
                    <SelectItem key={i.id} value={i.id.toString()}>
                      {i.ingredientCode} — {i.name || i.materialName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-gray-900 font-medium">Min Quantity</Label>
              <Input
                type="number"
                className="bg-white border-gray-200 mt-1"
                value={form.minQuantity}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, minQuantity: e.target.value }))
                }
              />
              {errors.minQuantity && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.minQuantity}
                </p>
              )}
            </div>
            <div>
              <Label className="text-gray-900 font-medium">Max Quantity</Label>
              <Input
                type="number"
                className="bg-white border-gray-200 mt-1"
                value={form.maxQuantity}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, maxQuantity: e.target.value }))
                }
              />
              {errors.maxQuantity && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.maxQuantity}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? 'Assigning...' : 'Assign Bin'}
            </Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
