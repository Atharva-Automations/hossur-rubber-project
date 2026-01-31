'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Plus, Trash2, QrCode, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Card, Header, PageContainer, Section } from '@/components/global';
import { Button } from '@/components/ui/button';
import { StatsGrid } from '@/components/global';
import { KpiCard } from '@/components/ui/kpi-card';
import ProductionScanModal from './components/ProductionScanModal';
import ScanQrModal from './components/ScanQrModal';
import OutwardDetailsModal from './components/OutwardDetailsModal';
import {
  useOutwardAnalytics,
  useOutwardData,
  useDeleteOutward,
} from '@/hooks/useOutwards';
import FilterBar from '@/components/ui/filter-bar';
import { DataTableShell } from '@/components/ui/datatable-shell';
import { Outward } from '@/types/outward';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function OutwardPage() {
  const { data = [], isLoading } = useOutwardData();
  const { mutate: deleteOutward } = useDeleteOutward();
  const router = useRouter();

  const [scanOpen, setScanOpen] = useState(false);
  const [scanQrOpen, setScanQrOpen] = useState(false);
  const [scanOutwardId, setScanOutwardId] = useState<number | null>(null);

  const [selectedEntry, setSelectedEntry] = useState<Outward | null>(null);
  const [openDetails, setOpenDetails] = useState(false);

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<Outward | null>(null);

  const stats = useOutwardAnalytics().data || {
    total: 0,
    pending: 0,
    completed: 0,
  };

  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    sort: 'desc',
  });

  const filteredData = useMemo(() => {
    let result = [...data];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.outwardNumber?.toLowerCase().includes(q) ||
          r.materialName?.toLowerCase().includes(q) ||
          false
      );
    }

    if (filters.status !== 'All') {
      result = result.filter((r) => r.status === filters.status);
    }

    // Apply sorting
    result.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return filters.sort === 'asc' ? ta - tb : tb - ta;
    });

    return result;
  }, [data, filters]);

  return (
    <PageContainer>
      <Header
        title="Outward Materials"
        description="Track and manage material dispatches from production"
        icon="📤"
      />

      {/* KPI cards */}
      <div className="mt-8">
        <StatsGrid columns={3}>
          <KpiCard title="Total Outwards" value={stats.total} gradient="blue" />
          <KpiCard
            title="Pending Issues"
            value={stats.pending}
            gradient="pink"
          />
          <KpiCard title="Completed" value={stats.completed} gradient="green" />
        </StatsGrid>
      </div>

      {/* Top Action Bar */}
      <div className="mt-8 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Materials Overview
          </h2>
          <p className="text-gray-600 text-sm">Track outward dispatches</p>
        </div>

        <div className="flex items-center gap-3">
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
      </div>

      {/* Outward Entries Table */}
      <Section
        title="Outwards Entry list"
        description="View and manage all outward materials"
        className="mt-8"
      >
        <Card noPadding>
          <div className="p-6 border-b border-gray-200">
            <FilterBar
              filters={filters}
              setFilters={(updater) => {
                const updated = updater(filters);
                setFilters({
                  search: updated.search ?? '',
                  status: updated.status ?? 'All',
                  sort: updated.sort ?? 'desc',
                });
              }}
            />
          </div>

          <div className="overflow-x-auto">
            <DataTableShell<Outward>
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
                  header: 'Name',
                  render: (r) => (
                    <div className="font-medium text-gray-900">
                      {r.materialName || '-'}
                    </div>
                  ),
                },
                {
                  key: 'quantity',
                  header: 'Total quantity',
                  render: (r) => (
                    <span className="text-gray-600">{r.quantity || 0}</span>
                  ),
                },
                {
                  key: 'numberOfBags',
                  header: 'Bags',
                  render: (r) => (
                    <span className="text-gray-600">
                      {r.qrScanStatus?.totalBags || 0}
                    </span>
                  ),
                },
                {
                  key: 'createdAt',
                  header: 'Created Date',
                  render: (r) => (
                    <span className="text-gray-600">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString()
                        : '-'}
                    </span>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => (
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        r.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {r.status || '-'}
                    </span>
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
                          setScanOutwardId(r.id);
                          setScanQrOpen(true);
                        }}
                        className="border-blue-200 hover:bg-blue-50"
                        title="Scan QR"
                      >
                        <QrCode className="w-4 h-4 text-blue-600" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/outward/add?edit=${r.id}`);
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

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
        <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-lg font-semibold">
              Delete Outward Entry
            </DialogTitle>
          </DialogHeader>

          <p className="text-gray-600 text-sm">
            Are you sure you want to delete this outward entry?
            {entryToDelete && (
              <>
                <br />
                <br />
                <strong>
                  {entryToDelete.outwardNumber || `#${entryToDelete.id}`}
                </strong>{' '}
                with <strong>{entryToDelete.items?.length || 0} items</strong>
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
                  deleteOutward(entryToDelete.id);
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
      <ProductionScanModal open={scanOpen} onClose={() => setScanOpen(false)} />

      {/* Scan QR modal for individual outward entries */}
      {scanOutwardId !== null && (
        <ScanQrModal
          open={scanQrOpen}
          onClose={(v) => {
            setScanQrOpen(v);
            if (!v) setScanOutwardId(null);
          }}
          outwardId={scanOutwardId}
        />
      )}

      {/* Outward details modal */}
      <OutwardDetailsModal
        open={openDetails}
        onClose={() => {
          setOpenDetails(false);
          setSelectedEntry(null);
        }}
        item={selectedEntry}
      />
    </PageContainer>
  );
}
