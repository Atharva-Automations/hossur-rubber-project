'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

export default function AddIngredientPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    ingredientCode: '',
    name: '',
    type: '',
    materialName: '',
  });

  // Fetch all materials (from inward)
  const { data: materials = [], isLoading: loadingMaterials } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const res = await api.get('/inward/materials');
      return res.data || [];
    },
  });

  // Fetch existing ingredients to filter assigned materials
  const { data: ingredients = [] } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const res = await api.get('/ingredients');
      return res.data || [];
    },
  });

  // Filter out materials already assigned to ingredients
  const assignedMaterials = ingredients.map((ing: any) => ing.materialName);
  const availableMaterials = materials.filter(
    (m: string) => !assignedMaterials.includes(m)
  );

  const { mutateAsync: createIngredient, isPending } = useMutation({
    mutationFn: (data: any) => api.post('/ingredients', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] });
      toast({ title: 'Ingredient added successfully!' });
      router.push('/ingredients');
    },
    onError: (err: any) => {
      toast({
        title: 'Error adding ingredient',
        description: err.response?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const handleChange = (key: string, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!formData.ingredientCode || !formData.materialName || !formData.type) {
      toast({
        title: 'Missing Fields',
        description:
          'Please fill in Ingredient Code, Type, and select a Material.',
        variant: 'destructive',
      });
      return;
    }
    await createIngredient(formData);
  };

  // Ingredient types
  const ingredientTypes = [
    { label: 'Base Polymer', value: 'BASE_POLYMER' },
    { label: 'Filler', value: 'FILLER' },
    { label: 'Activator', value: 'ACTIVATOR' },
    { label: 'Accelerator', value: 'ACCELERATOR' },
    { label: 'Curing Agent', value: 'CURING_AGENT' },
    { label: 'Processing Aid', value: 'PROCESSING_AID' },
    { label: 'Pigment', value: 'PIGMENT' },
    { label: 'Other', value: 'OTHER' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Add Ingredient</h2>

        <div className="space-y-4">
          {/* Ingredient Code */}
          <div>
            <Label>Ingredient Code</Label>
            <Input
              placeholder="e.g., IN001"
              value={formData.ingredientCode}
              onChange={(e) => handleChange('ingredientCode', e.target.value)}
            />
          </div>

          {/* Ingredient Name */}
          <div>
            <Label>Ingredient Name</Label>
            <Input
              placeholder="Optional"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          {/* Ingredient Type */}
          <div>
            <Label>Ingredient Type</Label>
            <select
              className="w-full border rounded-md p-2 bg-white"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="">Select type</option>
              {ingredientTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Material Dropdown */}
          <div>
            <Label>Material</Label>
            <select
              className="w-full border rounded-md p-2 bg-white"
              value={formData.materialName}
              onChange={(e) => handleChange('materialName', e.target.value)}
              disabled={loadingMaterials}
            >
              <option value="">
                {loadingMaterials
                  ? 'Loading materials...'
                  : availableMaterials.length > 0
                  ? 'Select material'
                  : 'No unassigned materials available'}
              </option>
              {availableMaterials.map((m: any, i: number) => (
                <option key={i} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => router.push('/ingredients')}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
