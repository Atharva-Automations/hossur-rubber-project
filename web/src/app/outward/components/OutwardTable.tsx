'use client';

import React, { useState } from 'react';
import OutwardActions from './OutwardActions';
import ScanQrModal from './ScanQrModal';
import { useOutwardList } from '@/hooks/useOutwards';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function OutwardTable() {
  const { data = [], isLoading } = useOutwardList();
  const [openScan, setOpenScan] = useState(false);
  const [selectedOutward, setSelectedOutward] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const visibleData = data.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (isLoading) return <p>Loading Outward Entries...</p>;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>No. of Bags</TableHead>
            <TableHead>Issued To</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleData.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.materialName}</TableCell>
              <TableCell>
                {item.quantity} {item.unit}
              </TableCell>
              <TableCell>{item.qrScanStatus?.totalBags || '-'}</TableCell>
              <TableCell>{item.issuedTo}</TableCell>
              <TableCell>
                {new Date(item.createdAt).toLocaleDateString('en-GB')}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'Completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {item.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setSelectedOutward(item.id);
                      setOpenScan(true);
                    }}
                    title="Scan QR"
                  >
                    <QrCode className="h-4 w-4 text-blue-600" />
                  </Button>
                  <OutwardActions
                    item={item}
                    onEdit={() => {
                      // edit item
                    }}
                    onDelete={() => {
                      // delete items
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex gap-1 items-center">
        {/* Previous */}
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => {
            if (p === 1 || p === totalPages) return true;
            if (Math.abs(p - page) <= 1) return true;
            return false;
          })
          .map((p, idx, arr) => {
            const prev = arr[idx - 1];
            const showDots = prev && p - prev > 1;

            return (
              <React.Fragment key={p}>
                {showDots && <span className="px-2 text-gray-500">...</span>}
                <Button
                  size="sm"
                  variant={page === p ? 'default' : 'outline'}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              </React.Fragment>
            );
          })}

        {/* Next */}
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>

      {selectedOutward && (
        <ScanQrModal
          outwardId={selectedOutward}
          open={openScan}
          onClose={setOpenScan}
        />
      )}
    </div>
  );
}
