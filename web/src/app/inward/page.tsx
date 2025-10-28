'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import InwardTable from './components/InwardTable';
import FilterBar from './components/FilterBar';
import InwardAnalytics, { InwardRow } from './components/InwardAnalytics';
import AddInwardDrawer from './components/AddInwardDrawer';
// import { Button } from '@/components/ui/button';
// import { Plus } from 'lucide-react';
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
  const [rows, setRows] = useState<InwardRow[]>(initialRows);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Inward Materials</h2>
        <AddInwardDrawer
          onSubmit={(data) => {
            console.log('New Inward Entry:', data);
          }}
        ></AddInwardDrawer>
      </div>

      {/* NEW: analytics */}
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
