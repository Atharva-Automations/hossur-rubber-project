'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
// import { useState } from 'react';
import FilterBar from './components/FilterBar';
import BinTable from './components/BinTable';
import Link from 'next/link';
// import AssignBinDrawer from './components/AssignBinDrawer';

export default function BinsPage() {
  // const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Bin Assignment</h2>
        <div className="flex gap-5">
          <Link href="/bins/add">
            <Button
              // onClick={() => setOpenDrawer(true)}
              className="text-white bg-blue-600 hover:bg-blue-700"
            >
              + Assign Bin
            </Button>
          </Link>
          <Link href="/bins/status">
            <Button
              // onClick={() => setOpenDrawer(true)}
              className="text-white bg-blue-600 hover:bg-blue-700"
            >
              Bin Status
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter/Search Bar */}
      <FilterBar />

      {/* Main Table */}
      <BinTable />

      {/* Drawer for Assigning Bin */}
      {/* <AssignBinDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} /> */}
    </DashboardLayout>
  );
}
