'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InwardTable from './components/InwardTable';
import FilterBar from './components/FilterBar';
import InwardAnalytics from './components/InwardAnalytics';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useInwardData } from '@/hooks/useInwardData';

export default function InwardPage() {
  // ✅ State for filters
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    sort?: 'asc' | 'desc';
  }>({
    search: '',
    status: 'All',
    sort: 'desc',
  });

  // ✅ Fetch data from backend
  const { data = [], isLoading, isError } = useInwardData(filters);

  const handleFilterChange = (updatedFilters: any) => {
    setFilters(updatedFilters);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Inward Materials</h2>

        <Link href="/inward/add">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={16} />
            Add Inward
          </Button>
        </Link>
      </div>

      {/* KPI & Charts */}
      <div className="mb-4">
        <InwardAnalytics rows={data} />
      </div>

      {/* Filters */}
      <FilterBar onFilterChange={handleFilterChange} />

      {/* Table */}
      <div className="mt-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : isError ? (
          <p>Error loading inward materials.</p>
        ) : (
          <InwardTable data={data} />
        )}
      </div>
    </DashboardLayout>
  );
}
