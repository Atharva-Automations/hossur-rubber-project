'use client';

import { useState } from 'react';
import { useBins } from '@/hooks/useBins';
import { useAssignBin } from '@/hooks/useAssignBins';
import { useUnassignedIngredients } from '@/hooks/useUnassignedIngredients';
import DashboardLayout from '@/components/layout/DashboardLayout';
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

  const availableBins = allBins.filter((b: any) => !b.ingredientId);

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
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-white p-6 shadow-sm rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">
          Assign Bin to Ingredient
        </h2>

        {/* Bin Number */}
        <div className="mb-4">
          <Label>Bin Number</Label>
          <Select
            value={form.binNumber}
            onValueChange={(v) =>
              setForm((prev) => ({ ...prev, binNumber: v }))
            }
          >
            <SelectTrigger className="bg-white mt-1">
              <SelectValue placeholder="Select Bin" />
            </SelectTrigger>
            <SelectContent className="bg-white">
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
        <div className="mb-4">
          <Label>Select Ingredient</Label>
          <Select
            value={form.ingredientId}
            onValueChange={(v) =>
              setForm((prev) => ({ ...prev, ingredientId: v }))
            }
          >
            <SelectTrigger className="bg-white mt-1">
              <SelectValue placeholder="Select ingredient" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {availableIngredients.length === 0 ? (
                <SelectItem value="none" disabled>
                  All ingredients assigned
                </SelectItem>
              ) : (
                availableIngredients.map((i: any) => (
                  <SelectItem key={i.id} value={i.id.toString()}>
                    {i.ingredientCode} — {i.name || i.materialName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Quantities */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Min Quantity</Label>
            <Input
              type="number"
              value={form.minQuantity}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, minQuantity: e.target.value }))
              }
            />
            {errors.minQuantity && (
              <p className="text-xs text-red-500 mt-1">{errors.minQuantity}</p>
            )}
          </div>
          <div>
            <Label>Max Quantity</Label>
            <Input
              type="number"
              value={form.maxQuantity}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, maxQuantity: e.target.value }))
              }
            />
            {errors.maxQuantity && (
              <p className="text-xs text-red-500 mt-1">{errors.maxQuantity}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Assigning...' : 'Assign Bin'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
