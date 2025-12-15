'use client';
import { Header, PageContainer } from '@/components/global';
import { Button } from '@/components/ui/button';
import FilterBar from './components/FilterBar';
import BinTable from './components/BinTable';
import Link from 'next/link';

export default function BinsPage() {
  return (
    <PageContainer>
      <Header
        title="Bin Assignment"
        description="Manage and assign material bins to production batches"
        icon="📊"
      />

      <div className="mt-8 flex justify-end gap-3">
        <Link href="/bins/status">
          <Button className="text-white bg-blue-600 hover:bg-blue-700">
            Bin Status
          </Button>
        </Link>
        <Link href="/bins/add">
          <Button className="text-white bg-blue-600 hover:bg-blue-700">
            + Assign Bin
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        <FilterBar />
      </div>

      <div className="mt-4">
        <BinTable />
      </div>
    </PageContainer>
  );
}
