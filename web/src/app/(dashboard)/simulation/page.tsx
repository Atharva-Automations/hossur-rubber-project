'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Header, PageContainer } from '@/components/global';
import { Button } from '@/components/ui/button';
import BatchTable from './components/batchTable';

export default function SimulationPage() {
  return (
    <PageContainer>
      <Header
        title="Process Simulation"
        description="Track and manage process simulations"
        icon="⚙️"
      />

      <div className="mt-8 flex justify-end">
        <Link href="/simulation/add">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={16} />
            Create Batch
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        <BatchTable />
      </div>
    </PageContainer>
  );
}
