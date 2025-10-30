'use client';

import { useInwardData, useDeleteInward } from '@/hooks/useInward';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import InwardActions from './InwardActions';

export default function InwardTable() {
  const { data = [], isLoading, isError } = useInwardData();
  const del = useDeleteInward();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading inward materials.</p>;

  const handleDelete = (id: number) => del.mutate(id);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-2 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Quantity (KG)</TableHead>
            <TableHead>Bag Weight (KG)</TableHead>
            <TableHead>MFG Date</TableHead>
            <TableHead>EXP Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                No inward materials found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row: any) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell className="font-medium">
                  {row.materialName}
                </TableCell>
                <TableCell>{row.supplierName}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.bagWeight ?? '-'}</TableCell>
                <TableCell>
                  {new Date(row.mfgDate).toLocaleDateString('en-IN')}
                </TableCell>
                <TableCell>
                  {new Date(row.expDate).toLocaleDateString('en-IN')}
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
