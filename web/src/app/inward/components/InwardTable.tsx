'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import InwardActions from './InwardActions';

const sampleData = [
  {
    id: 1,
    name: 'Zinc Oxide',
    qty: 100,
    unit: 'KG',
    bags: 20,
    supplier: 'ABC Polymers',
    date: '2025-10-28',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Carbon Black',
    qty: 50,
    unit: 'KG',
    bags: 10,
    supplier: 'XYZ Chemicals',
    date: '2025-10-27',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Stearic Acid',
    qty: 30,
    unit: 'KG',
    bags: 6,
    supplier: 'Delta Supplies',
    date: '2025-10-25',
    status: 'Expired',
  },
];

export default function InwardTable() {
  const [data, setData] = useState(sampleData);

  // Temporary CRUD handlers (for frontend demo)
  const handleEdit = (id: number, updated: any) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  };

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
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>{row.supplier}</TableCell>
              <TableCell>
                {row.qty} {row.unit}
              </TableCell>
              <TableCell>{row.bags}</TableCell>
              <TableCell>{row.date}</TableCell>
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
                  onEdit={(updated: any) => handleEdit(row.id, updated)}
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
