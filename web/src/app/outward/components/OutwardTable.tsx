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
import OutwardActions from './OutwardActions';

const sampleData = [
  {
    id: 1,
    materialName: 'Zinc Oxide',
    quantity: 100,
    unit: 'KG',
    issuedTo: 'Mixing Line 1',
    purpose: 'Production',
    date: '2025-10-29',
    status: 'Completed',
  },
  {
    id: 2,
    materialName: 'Carbon Black',
    quantity: 50,
    unit: 'KG',
    issuedTo: 'Line 2',
    purpose: 'Trial',
    date: '2025-10-28',
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

  const handleQr = (id: number) => {
    console.log('Show QR for outward entry', id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Issued To</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.materialName}</TableCell>
              <TableCell>
                {item.quantity} {item.unit}
              </TableCell>
              <TableCell>{item.issuedTo}</TableCell>
              <TableCell>{item.purpose}</TableCell>
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
                  onEdit={(u) => handleEdit(item.id, u)}
                  onDelete={() => handleDelete(item.id)}
                  onQr={() => handleQr(item.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
