'use client';

import { useOutwardList } from '@/hooks/useOutwards';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import OutwardActions from './OutwardActions';
import { QrCode } from 'lucide-react';
import ScanQrModal from './ScanQrModal';
import { useState } from 'react';

export default function OutwardTable() {
  const { data = [], isLoading } = useOutwardList();
  const [openScan, setOpenScan] = useState(false);
  const [selectedOutward, setSelectedOutward] = useState<number | null>(null);

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
          {data.map((item: any) => (
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
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
