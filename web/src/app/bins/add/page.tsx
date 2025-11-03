'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function BinAssignmentPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    binNumber: '',
    ingredientId: '',
    minQuantity: '',
    maxQuantity: '',
  });

  const { data: ingredients = [] } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => (await api.get('/ingredients')).data,
  });

  //   const { data: bins = [] } = useQuery({
  //     queryKey: ['bins'],
  //     queryFn: async () => (await api.get('/bins')).data,
  //   });

  const createBin = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        ingredientId: Number(form.ingredientId),
        minQuantity: Number(form.minQuantity),
        maxQuantity: Number(form.maxQuantity),
      };
      return await api.post('/bins', payload);
    },
    onSuccess: () => {
      toast({ title: 'Bin assigned successfully ✅' });
      qc.invalidateQueries({ queryKey: ['bins'] });
      setForm({
        binNumber: '',
        ingredientId: '',
        minQuantity: '',
        maxQuantity: '',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error assigning bin',
        description: err.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const unassignedIngredients = ingredients.filter(
    (i: any) => i.bins.length === 0
  );

  const handleChange = (key: string, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-lg shadow max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          Assign Bin to Ingredient
        </h2>

        <div className="space-y-4">
          <div>
            <Label>Bin Number</Label>
            <Input
              value={form.binNumber}
              onChange={(e) => handleChange('binNumber', e.target.value)}
            />
          </div>

          <div>
            <Label>Select Ingredient</Label>
            <Select
              value={form.ingredientId}
              onValueChange={(v) => handleChange('ingredientId', v)}
            >
              <SelectTrigger className="bg-white mt-1">
                <SelectValue placeholder="Select ingredient" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {unassignedIngredients.map((i: any) => (
                  <SelectItem key={i.id} value={String(i.id)}>
                    {i.ingredientCode} — {i.materialName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Quantity</Label>
              <Input
                type="number"
                value={form.minQuantity}
                onChange={(e) => handleChange('minQuantity', e.target.value)}
              />
            </div>
            <div>
              <Label>Max Quantity</Label>
              <Input
                type="number"
                value={form.maxQuantity}
                onChange={(e) => handleChange('maxQuantity', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => createBin.mutate()}
              disabled={createBin.isPending}
            >
              {createBin.isPending ? 'Assigning...' : 'Assign Bin'}
            </Button>
          </div>
        </div>

        {/* ✅ Bin List */}
      </div>
    </DashboardLayout>
  );
}
