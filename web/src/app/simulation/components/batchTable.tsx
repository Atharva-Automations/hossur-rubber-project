'use client';

import Link from 'next/link';
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

type BatchSummary = {
  id: number;
  recipeId: number;
  quantity: number;
  status: string;
  createdAt: string;
  recipe?: { id: number; recipeCode?: string; name?: string } | null;
};

export default function BatchTable() {
  const qc = useQueryClient();

  const {
    data: batches = [],
    isPending,
    isError,
    refetch,
  } = useQuery<BatchSummary[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      const res = await api.get('/batch');
      return res.data;
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/batch/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast({ title: 'Deleted', description: 'Batch deleted.' });
      qc.invalidateQueries({ queryKey: ['batches'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Delete failed',
        description: err?.response?.data?.message || 'Could not delete batch.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: number) => {
    if (!confirm('Delete this batch? This action cannot be undone.')) return;
    deleteMut.mutate(id);
  };

  if (isPending) return <div className="text-gray-500">Loading batches...</div>;
  if (isError)
    return <div className="text-red-500">Failed to load batches.</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Created Batches</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="text-gray-600">
          No batches found. Create one to start.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left text-sm text-gray-600 border-b">
                <th className="py-3 px-2">ID</th>
                <th className="py-3 px-2">Recipe</th>
                <th className="py-3 px-2">Qty</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Created</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-b last:border-b-0">
                  <td className="py-3 px-2 align-top">{b.id}</td>
                  <td className="py-3 px-2">
                    {b.recipe?.recipeCode
                      ? `${b.recipe.recipeCode} — ${b.recipe.name || ''}`
                      : `Recipe #${b.recipeId}`}
                  </td>
                  <td className="py-3 px-2 align-top">{b.quantity}</td>
                  <td className="py-3 px-2 align-top">
                    <span
                      className={[
                        'inline-block px-2 py-0.5 rounded text-xs font-medium',
                        b.status === 'CREATED'
                          ? 'bg-gray-100 text-gray-800'
                          : b.status === 'WEIGHING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : b.status === 'EXECUTING'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800',
                      ].join(' ')}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 align-top">
                    {b.createdAt
                      ? format(new Date(b.createdAt), 'dd/MM/yyyy HH:mm')
                      : '—'}
                  </td>

                  <td className="py-3 px-2 align-top text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/simulation/${b.id}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>

                      <Link href={`/simulation/${b.id}/execute`}>
                        <Button size="sm">Start</Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(b.id)}
                        disabled={deleteMut.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
