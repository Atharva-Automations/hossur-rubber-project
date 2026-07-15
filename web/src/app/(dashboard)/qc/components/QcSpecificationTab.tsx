'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/global';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import {
  qcApi,
  type QcSpecification,
  type QcSpecificationPayload,
} from '../services/qc.api';
import QcSpecificationTable from './QcSpecificationTable';

const parameterFields = [
  { key: 'hardness', label: 'Hardness' },
  { key: 'tensile', label: 'Tensile' },
  { key: 'elongation', label: 'Elongation' },
  { key: 'specificGravity', label: 'Specific Gravity' },
  { key: 'compressionSet', label: 'Compression Set' },
] as const;

export default function QcSpecificationTab() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    recipeId: string;
    hardness: string;
    tensile: string;
    elongation: string;
    specificGravity: string;
    compressionSet: string;
  }>({
    recipeId: '',
    hardness: '',
    tensile: '',
    elongation: '',
    specificGravity: '',
    compressionSet: '',
  });

  const { data: recipes = [], isLoading: loadingRecipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => (await api.get('/recipes')).data,
  });

  const createSpecification = useMutation({
    mutationFn: (data: QcSpecificationPayload) =>
      qcApi.createSpecification(data),
    onSuccess: () => {
      toast({ title: 'QC specification created successfully' });
      queryClient.invalidateQueries({ queryKey: ['qc-specifications'] });
      resetForm();
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to create QC specification',
        description: err.response?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const updateSpecification = useMutation({
    mutationFn: ({ id, data }: { id: number; data: QcSpecificationPayload }) =>
      qcApi.updateSpecification(id, data),
    onSuccess: () => {
      toast({ title: 'QC specification updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['qc-specifications'] });
      resetForm();
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to update QC specification',
        description: err.response?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      recipeId: '',
      hardness: '',
      tensile: '',
      elongation: '',
      specificGravity: '',
      compressionSet: '',
    });
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleEdit = (item: QcSpecification) => {
    setEditingId(item.id);
    setFormData({
      recipeId: String(item.recipeId),
      hardness: item.hardness?.toString() ?? '',
      tensile: item.tensile?.toString() ?? '',
      elongation: item.elongation?.toString() ?? '',
      specificGravity: item.specificGravity?.toString() ?? '',
      compressionSet: item.compressionSet?.toString() ?? '',
    });
  };

  const handleSubmit = () => {
    if (!formData.recipeId) {
      toast({
        title: 'Recipe is required',
        description: 'Please select a recipe before saving the specification.',
        variant: 'destructive',
      });
      return;
    }

    const payload: QcSpecificationPayload = {
      recipeId: Number(formData.recipeId),
      hardness: formData.hardness ? Number(formData.hardness) : undefined,
      tensile: formData.tensile ? Number(formData.tensile) : undefined,
      elongation: formData.elongation ? Number(formData.elongation) : undefined,
      specificGravity: formData.specificGravity
        ? Number(formData.specificGravity)
        : undefined,
      compressionSet: formData.compressionSet
        ? Number(formData.compressionSet)
        : undefined,
    };

    if (editingId) {
      updateSpecification.mutate({ id: editingId, data: payload });
      return;
    }

    createSpecification.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId
              ? 'Update recipe QC specification'
              : 'Create recipe QC specification'}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Define the target QC parameters for each recipe so inspection
            results can be compared against them.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div>
              <Label className="text-gray-900">Recipe</Label>
              <Select
                value={formData.recipeId}
                onValueChange={(value) => handleChange('recipeId', value)}
                disabled={loadingRecipes}
              >
                <SelectTrigger className="mt-2 bg-white border-gray-200">
                  <SelectValue
                    placeholder={
                      loadingRecipes ? 'Loading recipes...' : 'Select recipe'
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {recipes.map(
                    (recipe: {
                      id: number;
                      recipeCode: string;
                      name: string;
                    }) => (
                      <SelectItem key={recipe.id} value={String(recipe.id)}>
                        {recipe.recipeCode} - {recipe.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {parameterFields.map((field) => (
                <div key={field.key}>
                  <Label className="text-gray-900">{field.label}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData[field.key]}
                    onChange={(event) =>
                      handleChange(field.key, event.target.value)
                    }
                    className="mt-2 bg-white border-gray-200"
                    placeholder="Enter value"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-medium text-gray-900">How this works</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>• Choose a recipe and define its target QC values.</li>
              <li>• One specification can exist per recipe.</li>
              <li>
                • The inspection screen will compare the scanned batch against
                these values.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              createSpecification.isPending || updateSpecification.isPending
            }
          >
            {editingId ? 'Update Specification' : 'Save Specification'}
          </Button>
        </div>
      </Card>

      <div>
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Configured specifications
          </h3>
          <p className="text-sm text-gray-600">
            Review and manage the recipe-wise QC targets.
          </p>
        </div>
        <QcSpecificationTable onEdit={handleEdit} />
      </div>
    </div>
  );
}
