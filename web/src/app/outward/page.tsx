'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import OutwardDashboard from './components/OutwardDashboard';
import OutwardTable from './components/OutwardTable';

export default function OutwardPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Outward Materials</h2>

        <Link href="/outward/add">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={16} />
            Add Outward
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <OutwardDashboard />
      </div>

      <div className="mt-4">
        <OutwardTable />
      </div>
    </DashboardLayout>
  );
}
