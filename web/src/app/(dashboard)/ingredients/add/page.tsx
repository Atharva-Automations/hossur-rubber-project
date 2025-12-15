'use client';

import { useState } from 'react';
import { Header, PageContainer, Card } from '@/components/global';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import type { Ingredient } from '@/types/ingredients';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

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
  const assignedMaterials = ingredients.map(
    (ing: Ingredient) => ing.materialName
  );
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
    <PageContainer>
      <Header
        title="Add Ingredient"
        description="Create a new ingredient for use in recipes"
        icon="🧪"
      />

      <div className="mt-8 max-w-2xl">
        <Card>
          <div className="space-y-6">
            {/* Ingredient Code */}
            <div>
              <Label className="text-gray-900 font-medium">
                Ingredient Code <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g., IN001"
                value={formData.ingredientCode}
                onChange={(e) => handleChange('ingredientCode', e.target.value)}
                className="mt-2 bg-white border-gray-200"
              />
            </div>

            {/* Ingredient Name */}
            <div>
              <Label className="text-gray-900 font-medium">
                Ingredient Name
              </Label>
              <Input
                placeholder="Optional"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-2 bg-white border-gray-200"
              />
            </div>

            {/* Ingredient Type */}
            <div>
              <Label className="text-gray-900 font-medium">
                Ingredient Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(v) => handleChange('type', v)}
              >
                <SelectTrigger className="mt-2 bg-white border-gray-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {ingredientTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Material Dropdown */}
            <div>
              <Label className="text-gray-900 font-medium">
                Material <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.materialName}
                onValueChange={(v) => handleChange('materialName', v)}
                disabled={loadingMaterials}
              >
                <SelectTrigger className="mt-2 bg-white border-gray-200">
                  <SelectValue
                    placeholder={
                      loadingMaterials
                        ? 'Loading materials...'
                        : availableMaterials.length > 0
                        ? 'Select material'
                        : 'No unassigned materials'
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {availableMaterials.map((m: any, i: number) => (
                    <SelectItem key={i} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => router.push('/ingredients')}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
