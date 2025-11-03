'use client';

// import { useState } from 'react';
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
import DashboardLayout from '@/components/layout/DashboardLayout';
// import AddIngredientDrawer from './AddIngredientDrawer';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

export default function IngredientsPage() {
  const qc = useQueryClient();
  // const [openDrawer, setOpenDrawer] = useState(false);

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
    <DashboardLayout>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Ingredients</h2>
          <Link href="/ingredients/add">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} />
              Add Ingredient
            </Button>
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map((ing: any) => (
              <TableRow key={ing.id}>
                <TableCell>{ing.id}</TableCell>
                <TableCell>{ing.ingredientCode}</TableCell>
                <TableCell>{ing.name || '-'}</TableCell>
                <TableCell>{ing.materialName}</TableCell>
                <TableCell>{ing.type}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(ing.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* <AddIngredientDrawer
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
        /> */}
      </div>
    </DashboardLayout>
  );
}
