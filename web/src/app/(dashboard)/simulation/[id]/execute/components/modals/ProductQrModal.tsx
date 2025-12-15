'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';

interface ProductQrModalProps {
  open: boolean;
  onClose: () => void;
  qrData?: {
    batchId: string;
    productSequence: string;
    qrId: string;
    createdAt: string;
  };
}

export default function ProductQrModal({
  open,
  onClose,
  qrData,
}: ProductQrModalProps) {
  if (!qrData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6 bg-white">
        <DialogHeader>
          <DialogTitle>Product QR Code</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6">
          {/* Left side - details */}
          <div className="flex-1 space-y-2 text-sm">
            <div>
              <b>Batch:</b> {qrData.batchId}
            </div>
            <div>
              <b>Product:</b> {qrData.productSequence}
            </div>
            <div>
              <b>QR ID:</b> {qrData.qrId}
            </div>
            <div className="text-xs text-gray-500">
              Generated on: {new Date(qrData.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Right side - QR */}
          <div className="flex justify-center items-center">
            <QRCode value={qrData.qrId} size={80} />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={() => window.print()}
            className="bg-blue-600 text-white"
          >
            Print QR
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
