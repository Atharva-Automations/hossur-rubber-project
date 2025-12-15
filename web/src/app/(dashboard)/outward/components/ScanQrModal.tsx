'use client';

import api from '@/lib/api';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function ScanQrModal({
  open,
  onClose,
  outwardId,
}: {
  open: boolean;
  onClose: (v: boolean) => void;
  outwardId: number;
}) {
  const [qrInput, setQrInput] = useState('');
  const [scannedCount, setScannedCount] = useState(0);
  const [totalBags, setTotalBags] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!qrInput.trim()) {
      toast({
        title: 'Missing Input',
        description: 'Please enter or scan a QR ID before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/outward/scan-qr', {
        outwardId,
        qrId: qrInput.trim(),
      });

      const { message, scannedBags, totalBags, status } = res.data;

      setScannedCount(scannedBags);
      setTotalBags(totalBags);

      toast({
        title: status === 'Completed' ? 'All Bags Scanned' : 'Bag Scanned',
        description: message,
      });

      if (status === 'Completed') {
        setTimeout(() => onClose(false), 1200);
      }
    } catch (error: any) {
      // Smart error interpretation for better user messages
      const errMsg = error.response?.data?.message?.toLowerCase() || '';

      let userMessage = 'Unexpected error occurred. Please try again.';
      if (errMsg.includes('not found'))
        userMessage = 'Wrong QR ID – no such bag exists.';
      else if (errMsg.includes('already issued'))
        userMessage = 'This bag is already scanned.';
      else if (errMsg.includes('consumed'))
        userMessage = 'This bag is already used in production.';
      else if (errMsg.includes('belongs to'))
        userMessage = 'This QR belongs to a different material.';
      else if (errMsg.includes('invalid qr'))
        userMessage = 'Invalid or unreadable QR code.';

      toast({
        title: 'Scan Error',
        description: userMessage,
        variant: 'destructive',
      });
    } finally {
      setQrInput('');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
        <DialogHeader>
          <DialogTitle>📷 Scan QR Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Enter or scan the QR code printed on the material bag.
          </p>
          <Input
            placeholder="Enter QR ID (e.g., QR-00123)"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
          />
          {totalBags !== null && (
            <p className="text-xs text-gray-600 text-center">
              Scanned {scannedCount} / {totalBags} bags
            </p>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-3 mt-3">
          <Button variant="outline" onClick={() => onClose(false)}>
            Close
          </Button>
          <Button onClick={handleScan} disabled={loading}>
            {loading ? 'Scanning...' : 'Scan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
