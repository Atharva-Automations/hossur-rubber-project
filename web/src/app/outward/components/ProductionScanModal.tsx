'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProductionScan } from '@/hooks/useProductionScan';

export default function ProductionScanModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [qrId, setQrId] = useState('');
  const [result, setResult] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const { mutateAsync: scanQr, isPending } = useProductionScan();

  const handleScan = async () => {
    if (!qrId.trim()) return;

    try {
      const res = await scanQr(qrId.trim());
      setResult({ message: res.message, type: 'success' });
      setQrId('');
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Failed to scan QR for production.';
      setResult({ message, type: 'error' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Production Scan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Input
            placeholder="Enter or scan QR ID (e.g., QR-0005)"
            value={qrId}
            onChange={(e) => setQrId(e.target.value)}
            disabled={isPending}
          />

          {/* Feedback Messages */}
          {result && (
            <div
              className={`text-sm px-3 py-2 rounded-md ${
                result.type === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              {result.message}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={handleScan}
              disabled={!qrId || isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? 'Scanning...' : 'Scan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
