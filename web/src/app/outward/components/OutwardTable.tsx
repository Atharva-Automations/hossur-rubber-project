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
// import { Button } from '@/components/ui/button';
// import { Pencil, Trash2 } from 'lucide-react';
import OutwardActions from './OutwardActions';

const sampleData = [
  {
    id: 1,
    material: 'Zinc Oxide',
    issuedQty: 10,
    unit: 'KG',
    destination: 'Mixing Line 1',
    date: '2025-10-28',
    status: 'Completed',
  },
  {
    id: 2,
    material: 'Carbon Black',
    issuedQty: 5,
    unit: 'KG',
    destination: 'Kneader 2',
    date: '2025-10-27',
    status: 'Pending',
  },
];

export default function OutwardTable() {
  const [data, setData] = useState(sampleData);

  const handleEdit = (id: number, updated: any) => {
    setData(
      data.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const handleDelete = (id: number) => {
    setData(data.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Issued Qty</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.material}</TableCell>
              <TableCell>
                {item.issuedQty} {item.unit}
              </TableCell>
              <TableCell>{item.destination}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'Completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {item.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <OutwardActions
                  item={item}
                  onEdit={(updated) => handleEdit(item.id, updated)}
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
