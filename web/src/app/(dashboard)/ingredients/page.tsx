'use client';

import { Header, PageContainer, Card } from '@/components/global';
import type { Ingredient } from '@/types/ingredients';
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
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

export default function IngredientsPage() {
  const qc = useQueryClient();

  const { data: ingredients = [] } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => (await api.get('/ingredients')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/ingredients/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] });
      toast({
        title: 'Deleted',
        description: 'Ingredient removed successfully',
      });
    },
  });

  return (
    <PageContainer>
      <Header
        title="Ingredients"
        description="Manage recipe ingredients and their specifications"
        icon="🧪"
      />

      <div className="mt-8 flex justify-end">
        <Link href="/ingredients/add">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={16} />
            Add Ingredient
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-gray-50">
                <TableHead className="text-gray-900">ID</TableHead>
                <TableHead className="text-gray-900">Code</TableHead>
                <TableHead className="text-gray-900">Name</TableHead>
                <TableHead className="text-gray-900">Material</TableHead>
                <TableHead className="text-gray-900">Type</TableHead>
                <TableHead className="text-right text-gray-900">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ing: Ingredient) => (
                <TableRow
                  key={ing.id}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  <TableCell className="text-gray-900">{ing.id}</TableCell>
                  <TableCell className="text-gray-700">
                    {ing.ingredientCode}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {ing.name || '-'}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {ing.materialName}
                  </TableCell>
                  <TableCell className="text-gray-700">{ing.type}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(ing.id)}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </PageContainer>
  );
}
