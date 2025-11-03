'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

export default function AddBinDrawer({ open, onClose }: any) {
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    ingredientId: '',
    binNumber: '',
    minQuantity: '',
    maxQuantity: '',
  });

  const { data: ingredients = [] } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => (await api.get('/ingredients')).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/bins', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bins'] });
      toast({ title: 'Bin assigned successfully!' });
      setFormData({
        ingredientId: '',
        binNumber: '',
        minQuantity: '',
        maxQuantity: '',
      });
      onClose();
    },
  });

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Assign Bin</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Ingredient</Label>
            <select
              className="w-full border rounded-md p-2 bg-white"
              value={formData.ingredientId}
              onChange={(e) => handleChange('ingredientId', e.target.value)}
            >
              <option value="">Select ingredient</option>
              {ingredients.map((ing: any) => (
                <option key={ing.id} value={ing.id}>
                  {ing.ingredientCode} — {ing.materialName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Bin Number</Label>
            <Input
              type="number"
              placeholder="e.g., 6"
              value={formData.binNumber}
              onChange={(e) => handleChange('binNumber', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Quantity</Label>
              <Input
                type="number"
                placeholder="Min Qty"
                value={formData.minQuantity}
                onChange={(e) => handleChange('minQuantity', e.target.value)}
              />
            </div>
            <div>
              <Label>Max Quantity</Label>
              <Input
                type="number"
                placeholder="Max Qty"
                value={formData.maxQuantity}
                onChange={(e) => handleChange('maxQuantity', e.target.value)}
              />
            </div>
          </div>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() =>
              createMutation.mutate({
                ...formData,
                ingredientId: Number(formData.ingredientId),
                binNumber: Number(formData.binNumber),
                minQuantity: Number(formData.minQuantity),
                maxQuantity: Number(formData.maxQuantity),
              })
            }
          >
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
