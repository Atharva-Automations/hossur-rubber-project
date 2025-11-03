'use client';

import { useState } from 'react';
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
import AddBinDrawer from './AddBinsDrawer';
import { Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function BinsPage() {
  const qc = useQueryClient();
  const [openDrawer, setOpenDrawer] = useState(false);

  const { data: bins = [] } = useQuery({
    queryKey: ['bins'],
    queryFn: async () => (await api.get('/bins')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/bins/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bins'] });
      toast({ title: 'Deleted', description: 'Bin assignment removed' });
    },
  });

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Bin Assignments</h2>
          <Button onClick={() => setOpenDrawer(true)}>+ Assign Bin</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bin #</TableHead>
              <TableHead>Ingredient</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Min Qty</TableHead>
              <TableHead>Max Qty</TableHead>
              <TableHead>Current</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bins.map((b: any) => (
              <TableRow key={b.id}>
                <TableCell>{b.binNumber}</TableCell>
                <TableCell>{b.ingredient.ingredientCode}</TableCell>
                <TableCell>{b.ingredient.materialName}</TableCell>
                <TableCell>{b.minQuantity}</TableCell>
                <TableCell>{b.maxQuantity}</TableCell>
                <TableCell>{b.currentQuantity}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(b.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <AddBinDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} />
      </div>
    </DashboardLayout>
  );
}
