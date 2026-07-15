'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { qcApi, type QcSpecification } from '../services/qc.api';
import QcSpecificationActions from './QcSpecificationActions';

interface Props {
  onEdit: (item: QcSpecification) => void;
}

export default function QcSpecificationTable({ onEdit }: Props) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: specifications = [], isLoading } = useQuery({
    queryKey: ['qc-specifications'],
    queryFn: async () => (await qcApi.getSpecifications()).data,
  });

  const deleteSpecification = useMutation({
    mutationFn: (id: number) => qcApi.deleteSpecification(id),
    onSuccess: () => {
      toast({ title: 'QC specification deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['qc-specifications'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Error deleting QC specification',
        description: err.response?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <p className="text-sm text-gray-500">Loading QC specifications...</p>
    );
  }

  if (!specifications.length) {
    return <p className="text-sm text-gray-500">No QC specifications found.</p>;
  }

  const totalPages = Math.ceil(specifications.length / itemsPerPage);
  const visibleData = specifications.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Recipe</TableHead>
            <TableHead>Hardness</TableHead>
            <TableHead>Tensile</TableHead>
            <TableHead>Elongation</TableHead>
            <TableHead>Specific Gravity</TableHead>
            <TableHead>Compression Set</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleData.map((item: QcSpecification) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>
                <div className="font-medium">{item.recipe?.recipeCode}</div>
                <div className="text-xs text-gray-500">{item.recipe?.name}</div>
              </TableCell>
              <TableCell>{item.hardness ?? '-'}</TableCell>
              <TableCell>{item.tensile ?? '-'}</TableCell>
              <TableCell>{item.elongation ?? '-'}</TableCell>
              <TableCell>{item.specificGravity ?? '-'}</TableCell>
              <TableCell>{item.compressionSet ?? '-'}</TableCell>
              <TableCell className="text-right">
                <QcSpecificationActions
                  onEdit={() => onEdit(item)}
                  onDelete={() => deleteSpecification.mutate(item.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={page === p ? 'default' : 'outline'}
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
