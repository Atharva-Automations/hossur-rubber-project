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
import { qcApi, type QcInspectionHistoryItem } from '../services/qc.api';

interface Props {
  className?: string;
}

export default function QcHistoryTable({ className = '' }: Props) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['qc-inspections'],
    queryFn: async () => (await qcApi.getInspections()).data,
  });

  const printMutation = useMutation({
    mutationFn: async (item: QcInspectionHistoryItem) =>
      await qcApi.printQcLabel({
        qrId: item.finalBatch.qrId,
        recipeCode: item.finalBatch.recipe.recipeCode,
        batchNumber: item.finalBatch.executionBatch.batchNumber,
        qcResult: item.status,
      }),
    onSuccess: () => {
      toast({ title: 'QC label printed successfully' });
      queryClient.invalidateQueries({ queryKey: ['qc-inspections'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to print QC label',
        description: err.response?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <p className="text-sm text-gray-500">Loading inspection history...</p>
    );
  }

  if (!inspections.length) {
    return (
      <p className="text-sm text-gray-500">No QC inspection history found.</p>
    );
  }

  const totalPages = Math.ceil(inspections.length / itemsPerPage);
  const visibleData = inspections.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Final batch</TableHead>
              <TableHead>Batch number</TableHead>
              <TableHead>Execution</TableHead>
              <TableHead>Recipe</TableHead>
              <TableHead>QC Result</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.finalBatch.qrId}</TableCell>
                <TableCell>
                  {item.finalBatch.executionBatch.batchNumber}
                </TableCell>
                <TableCell>
                  {item.finalBatch.executionBatch.execution.executionCode}
                </TableCell>
                <TableCell>{item.finalBatch.recipe.recipeCode}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      item.status === 'PASS'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => printMutation.mutate(item)}
                  >
                    Print QR
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
