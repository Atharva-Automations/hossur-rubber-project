'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Header, PageContainer } from '@/components/global';
import { Button } from '@/components/ui/button';
import OutwardTable from './components/OutwardTable';
import OutwardDashboard from './components/OutwardDashboard';
import ProductionScanModal from './components/ProductionScanModal';

export default function OutwardPage() {
  const [scanOpen, setScanOpen] = useState(false);

  return (
    <PageContainer>
      <Header
        title="Outward Materials"
        description="Track and manage material dispatches from production"
        icon="📤"
      />

      <div className="mt-8 flex justify-end gap-3">
        <Button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setScanOpen(true)}
        >
          Production Scan
        </Button>
        <Link href="/outward/add">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={16} />
            Add Outward
          </Button>
        </Link>
      </div>

      <div className="mt-8">
        <OutwardDashboard />
      </div>

      <div className="mt-6">
        <OutwardTable />
      </div>

      <ProductionScanModal open={scanOpen} onClose={() => setScanOpen(false)} />
    </PageContainer>
  );
}
