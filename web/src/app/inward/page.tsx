'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InwardTable from './components/InwardTable';
import FilterBar from './components/FilterBar';
import InwardAnalytics, { InwardRow } from './components/InwardAnalytics';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const initialRows: InwardRow[] = [
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

export default function InwardPage() {
  const [rows] = useState<InwardRow[]>(initialRows);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Inward Materials</h2>

        <Link href="/inward/add">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={16} />
            Add Inward
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <InwardAnalytics rows={rows} />
      </div>

      <FilterBar onFilterChange={(filters) => console.log(filters)} />
      <div className="mt-4">
        <InwardTable />
      </div>
    </DashboardLayout>
  );
}
