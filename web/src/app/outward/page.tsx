'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import OutwardTable from './components/OutwardTable';
import AddOutwardDrawer from './components/AddOutwardDrawer';
import OutwardDashboard from './components/OutwardDashboard';

export default function OutwardPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Outward Materials</h1>
          <AddOutwardDrawer />
        </div>
        <OutwardDashboard />
        <OutwardTable />
      </div>
    </DashboardLayout>
  );
}
