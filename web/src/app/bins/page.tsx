'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import FilterBar from './components/FilterBar';
import BinTable from './components/BinTable';
import Link from 'next/link';

export default function BinsPage() {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Bin Assignment</h2>
        <div className="flex gap-5">
          <Link href="/bins/add">
            <Button className="text-white bg-blue-600 hover:bg-blue-700">
              + Assign Bin
            </Button>
          </Link>
          <Link href="/bins/status">
            <Button className="text-white bg-blue-600 hover:bg-blue-700">
              Bin Status
            </Button>
          </Link>
        </div>
      </div>

      <FilterBar />
      <BinTable />
    </DashboardLayout>
  );
}
