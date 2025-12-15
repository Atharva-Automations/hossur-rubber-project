'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useInwardData } from '@/hooks/useInward';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  // Legend,
  ResponsiveContainer,
} from 'recharts';

import {
  Header,
  PageContainer,
  Section,
  StatsGrid,
  Card,
} from '@/components/global';
import { KpiCard } from '@/components/ui/kpi-card';
// import { FilterShell } from '@/components/ui/filter-shell';
import { DataTableShell } from '@/components/ui/datatable-shell';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { Inward } from '@/types/inward';
import { StatusBadge } from '@/components/ui/status-badge';
import InwardDetailsModal from './components/InwardDetailsModal';
import EditInwardDrawer from './components/EditInwardDrawer';
import { Pencil, Trash2, QrCode } from 'lucide-react';
import { useDeleteInward } from '@/hooks/useInward';
import QrPreviewModal from './components/QrPreviewModal';
import FilterBar from './components/FilterBar';

export default function InwardPage() {
  const { data = [], isLoading } = useInwardData();
  const { mutate: deleteInward } = useDeleteInward();

  const [selectedEntry, setSelectedEntry] = useState<Inward | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<Inward | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    sort: 'desc',
  });

  const isExpired = (date: string) => new Date(date) < new Date();

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (filters.search.trim()) {
      result = result.filter((item) =>
        item.materialName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'All') {
      result = result.filter((item) => {
        const itemStatus = isExpired(item.expDate) ? 'Expired' : 'Active';
        return itemStatus === filters.status;
      });
    }

    // Sort
    // result.sort((a, b) => {
    //   const dateA = new Date(a.createdAt).getTime();
    //   const dateB = new Date(b.createdAt).getTime();
    //   return filters.sort === 'desc' ? dateB - dateA : dateA - dateB;
    // });

    return result;
  }, [data, filters]);

  const { stats, supplierChartData, materialChartData } = useMemo(() => {
    const expired = data.filter((d) => isExpired(d.expDate)).length;
    const totalQuantity = data.reduce((sum, d) => sum + d.quantity, 0);

    // Supplier data for bar chart
    const supplierMap = new Map<string, number>();
    data.forEach((d) => {
      const current = supplierMap.get(d.supplierName) || 0;
      supplierMap.set(d.supplierName, current + d.quantity);
    });
    const supplierChartData = Array.from(supplierMap.entries())
      .map(([name, quantity]) => ({
        name: name.length > 15 ? name.substring(0, 12) + '...' : name,
        quantity: Math.round(quantity * 100) / 100,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    // Material quantity data for pie chart
    const materialMap = new Map<string, number>();
    data.forEach((d) => {
      const current = materialMap.get(d.materialName) || 0;
      materialMap.set(d.materialName, current + d.quantity);
    });
    const colors = [
      '#3b82f6',
      '#06b6d4',
      '#ec4899',
      '#a855f7',
      '#f59e0b',
      '#10b981',
      '#ef4444',
      '#8b5cf6',
      '#14b8a6',
      '#f97316',
      '#6366f1',
      '#84cc16',
    ];
    const materialChartData = Array.from(materialMap.entries())
      .map(([name, quantity], index) => ({
        name: name.length > 15 ? name.substring(0, 12) + '...' : name,
        value: Math.round(quantity * 100) / 100,
        fill: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value);

    return {
      stats: {
        total: data.length,
        expired,
        active: data.length - expired,
        totalQuantity,
      },
      supplierChartData,
      materialChartData,
    };
  }, [data]);

  return (
    <PageContainer>
      {/* Header */}
      <Header
        title="Inward Material Management"
        description="Track incoming materials, monitor inventory, and manage suppliers"
        icon="📦"
      />

      {/* KPI Cards */}
      <StatsGrid columns={4}>
        <KpiCard
          title="Total Materials"
          value={stats.total}
          gradient="blue"
          icon="📊"
          trend={{ value: 12, positive: true }}
        />
        <KpiCard
          title="Active Items"
          value={stats.active}
          gradient="cyan"
          icon="✓"
          trend={{ value: 8, positive: true }}
        />
        <KpiCard
          title="Expired"
          value={stats.expired}
          gradient="pink"
          icon="⚠️"
          trend={{ value: 3, positive: false }}
        />
        <KpiCard
          title="Total Quantity"
          value={`${stats.totalQuantity.toFixed(1)}kg`}
          gradient="purple"
          icon="⚖️"
          trend={{ value: 25, positive: true }}
        />
      </StatsGrid>

      {/* Top Action Bar */}
      <div className="mt-8 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Materials Overview
          </h2>
          <p className="text-gray-600 text-sm">
            Top suppliers and inventory status
          </p>
        </div>
        <Link href="/inward/add">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            + Add Material
          </Button>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Suppliers Bar Chart */}
        <Card>
          <div className="pb-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Top Suppliers by Quantity
            </h3>
            <p className="text-sm text-gray-600">
              Received quantity from suppliers
            </p>
          </div>
          <div className="h-80 pt-4">
            {supplierChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => `${value} kg`}
                  />
                  <Bar
                    dataKey="quantity"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No supplier data available
              </div>
            )}
          </div>
        </Card>

        {/* Pie Chart - Material Quantity */}
        <Card>
          <div className="pb-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Total Material Quantity
            </h3>
            <p className="text-sm text-gray-600">
              Inventory distribution by material type
            </p>
          </div>
          <div className="h-80 pt-4">
            {materialChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={materialChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}kg`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {materialChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} kg`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No inventory data available
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Filter & Table Section */}
      <Section
        title="Materials List"
        description="View and manage all incoming materials"
        className="mt-8"
      >
        <Card noPadding>
          <div className="p-6 border-b border-gray-200">
            <FilterBar filters={filters} setFilters={setFilters} />
          </div>

          <div className="overflow-x-auto">
            <DataTableShell<Inward>
              loading={isLoading}
              data={filteredData}
              onRowClick={(row) => {
                setSelectedEntry(row);
                setOpenDetails(true);
              }}
              columns={[
                {
                  key: 'id',
                  header: 'ID',
                  render: (r) => (
                    <div className="font-semibold text-gray-900">#{r.id}</div>
                  ),
                },
                {
                  key: 'materialName',
                  header: 'Material',
                  render: (r) => (
                    <div className="font-medium text-gray-900">
                      {r.materialName}
                    </div>
                  ),
                },
                {
                  key: 'supplierName',
                  header: 'Supplier',
                  render: (r) => (
                    <span className="text-gray-600">{r.supplierName}</span>
                  ),
                },
                {
                  key: 'quantity',
                  header: 'Quantity',
                  render: (r) => (
                    <span className="font-semibold text-gray-900">
                      {r.quantity} {r.unit}
                    </span>
                  ),
                },
                {
                  key: 'bags',
                  header: 'Bags',
                  render: (r) => (
                    <span className="text-center text-gray-900">
                      {r.storedAsWhole
                        ? 1
                        : Math.ceil(r.quantity / (r.bagWeight || 1))}
                    </span>
                  ),
                },
                {
                  key: 'createdAt',
                  header: 'Entry Date',
                  render: (r) => (
                    <span className="text-gray-600">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString()
                        : '-'}
                    </span>
                  ),
                },
                {
                  key: 'expDate',
                  header: 'Exp. Date',
                  render: (r) => (
                    <span
                      className={
                        isExpired(r.expDate)
                          ? 'text-red-600 font-medium'
                          : 'text-gray-600'
                      }
                    >
                      {new Date(r.expDate).toLocaleDateString()}
                    </span>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => (
                    <StatusBadge
                      status={isExpired(r.expDate) ? 'Expired' : 'Active'}
                    />
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (r) => (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntry(r);
                          setOpenQR(true);
                        }}
                        className="border-blue-200 hover:bg-blue-50"
                        title="Preview QR"
                      >
                        <QrCode className="w-4 h-4 text-blue-600" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntry(r);
                          setOpenEdit(true);
                        }}
                        className="border-amber-200 hover:bg-amber-50"
                        title="Edit Entry"
                      >
                        <Pencil className="w-4 h-4 text-amber-600" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEntryToDelete(r);
                          setOpenDeleteConfirm(true);
                        }}
                        className="border-red-200 hover:bg-red-50"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Card>
      </Section>

      {/* Details Modal */}
      <InwardDetailsModal
        open={openDetails}
        onClose={() => {
          setOpenDetails(false);
          setSelectedEntry(null);
        }}
        item={selectedEntry}
        onEdit={() => setOpenEdit(true)}
      />

      {/* Edit Drawer */}
      <EditInwardDrawer
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedEntry(null);
        }}
        item={selectedEntry}
      />

      {/* QR Preview Modal */}
      {selectedEntry && (
        <QrPreviewModal
          open={openQR}
          onClose={() => {
            setOpenQR(false);
            setSelectedEntry(null);
          }}
          inwardId={selectedEntry.id}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
        <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-lg font-semibold">
              Delete Inward Entry
            </DialogTitle>
          </DialogHeader>

          <p className="text-gray-600 text-sm">
            Are you sure you want to delete this inward entry?
            {entryToDelete && (
              <>
                <br />
                <br />
                <strong>{entryToDelete.materialName}</strong> from{' '}
                <strong>{entryToDelete.supplierName}</strong> (
                {entryToDelete.quantity} {entryToDelete.unit})
              </>
            )}
          </p>

          <p className="text-gray-500 text-xs">This action cannot be undone.</p>

          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteConfirm(false);
                setEntryToDelete(null);
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>

            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (entryToDelete) {
                  deleteInward(entryToDelete.id);
                  setOpenDeleteConfirm(false);
                  setEntryToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
