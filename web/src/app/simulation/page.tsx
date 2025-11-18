'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BatchTable from './components/batchTable';

export default function InwardPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Process Tracking simulation</h2>

        <Link href="/simulation/add">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={16} />
            Create batch
          </Button>
        </Link>
      </div>
      <BatchTable />
    </DashboardLayout>
  );
}
