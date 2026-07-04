'use client';

import api from '@/lib/api';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useProductionScan } from '@/hooks/useProductionScan';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  const queryClient = useQueryClient();
  const { isPending } = useProductionScan();

  const handleScan = async () => {
    if (!qrId.trim()) return;

    try {
      const res = await api.post('/production/scan-qr', { qrId: qrId.trim() });

      toast({
        title: 'Scan Successful',
        description: res.data.message,
      });

      setResult({
        message: res.data.message,
        type: 'success',
      });

      setQrId('');
      queryClient.invalidateQueries({ queryKey: ['bin-status'] }); // ✅ Refresh Bin Status instantly
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || 'Failed to process scanned QR.';

      toast({
        title: 'Scan Error',
        description: errorMsg,
        variant: 'destructive',
      });

      setResult({
        message: errorMsg,
        type: 'error',
      });
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

          {/* ✅ Feedback message */}
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
              <span suppressHydrationWarning>
                {isPending ? 'Scanning...' : 'Scan'}
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
