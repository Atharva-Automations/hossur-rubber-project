'use client';

import { useDeleteInward } from '@/hooks/useInward';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import InwardActions from './InwardActions';

export default function InwardTable({ data = [] }: { data: any[] }) {
  const del = useDeleteInward();

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
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row: any) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell className="font-medium">{row.materialName}</TableCell>
              <TableCell>{row.supplierName}</TableCell>
              <TableCell>
                {row.quantity} {row.unit}
              </TableCell>
              <TableCell>{row.bags}</TableCell>
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
              <TableCell className="text-right space-x-2">
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
    </div>
  );
}
