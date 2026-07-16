'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { Pencil, Trash2 } from 'lucide-react';

interface Recipe {
  id: number;
  recipeCode: string;
  name: string;
  createdAt: string;
}

export default function RecipeTable() {
  const qc = useQueryClient();

  // ✅ Fetch recipes from backend
  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => (await api.get('/recipes')).data,
  });

  const deleteRecipe = useMutation({
    mutationFn: (id: number) => api.delete(`/recipes/${id}`),
    onSuccess: () => {
      toast({ title: 'Recipe deleted successfully 🗑️' });
      qc.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: (err: any) =>
      toast({
        title: 'Error deleting recipe',
        description: err.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      }),
  });

  if (isLoading) return <p className="text-gray-500">Loading recipes...</p>;
  if (!recipes.length)
    return <p className="text-gray-500">No recipes found.</p>;

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    deleteRecipe.mutate(id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-2 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recipe Code</TableHead>
            <TableHead>Recipe Name</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {recipes.map((recipe: Recipe) => (
            <TableRow key={recipe.id}>
              <TableCell className="font-medium">{recipe.recipeCode}</TableCell>
              <TableCell>{recipe.name}</TableCell>
              <TableCell>
                {new Date(recipe.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex justify-center space-x-2">
                <Link href={`/recipes/${recipe.id}`}>
                  <Button size="icon" variant="ghost" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(recipe.id)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
