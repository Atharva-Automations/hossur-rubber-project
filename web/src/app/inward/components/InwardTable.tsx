'use client';

import React from 'react';
import { useState } from 'react';
import InwardActions from './InwardActions';
import { useDeleteInward } from '@/hooks/useInward';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function InwardTable({ data = [] }: { data: any[] }) {
  const del = useDeleteInward();

  const [page, setPage] = useState(1);
  const itemsPerPage = 15;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const visibleData = data.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (!data.length) return <p>No entries found.</p>;

  const handleDelete = (id: number) => del.mutate(id);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-2 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Bags</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibleData.map((row: any) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell className="font-medium">{row.materialName}</TableCell>
              <TableCell>{row.supplierName}</TableCell>
              <TableCell>
                {row.quantity} {row.unit}
              </TableCell>
              <TableCell>
                {row.bagWeight === 0
                  ? '0'
                  : (row.quantity / row.bagWeight).toFixed(0)}
              </TableCell>
              <TableCell>
                {new Date(row.mfgDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    row.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {row.status}
                </span>
              </TableCell>
              <TableCell className="flex justify-center space-x-2">
                <InwardActions
                  item={row}
                  onEdit={(updated: any) => console.log('Edit:', updated)}
                  onDelete={(id: number) => handleDelete(id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex gap-1 items-center">
        {/* Previous */}
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => {
            // show only: first, last, current, and +/- 1 around current
            if (p === 1 || p === totalPages) return true;
            if (Math.abs(p - page) <= 1) return true;
            return false;
          })
          .map((p, idx, arr) => {
            const prev = arr[idx - 1];
            const showDots = prev && p - prev > 1;

            return (
              <React.Fragment key={p}>
                {showDots && <span className="px-2 text-gray-500">...</span>}
                <Button
                  size="sm"
                  variant={page === p ? 'default' : 'outline'}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              </React.Fragment>
            );
          })}

        {/* Next */}
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
