'use client';

import Link from 'next/link';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import OutwardDashboard from './components/OutwardDashboard';
import OutwardTable from './components/OutwardTable';
import ProductionScanModal from './components/ProductionScanModal';

export default function OutwardPage() {
  const [scanOpen, setScanOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Outward Materials</h2>
        <div className="flex space-x-2">
          <Link href="/outward/add">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} />
              Add Outward
            </Button>
          </Link>
          <Button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setScanOpen(true)}
          >
            {/* <Plus size={16} /> */}
            Production Scan
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <OutwardDashboard />
      </div>

      <div className="mt-4">
        <OutwardTable />
      </div>
      <ProductionScanModal open={scanOpen} onClose={() => setScanOpen(false)} />
    </DashboardLayout>
  );
}
