'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import QRCode from 'react-qr-code';

export default function QRPreviewModal({ open, onClose, item }: any) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white shadow-xl">
        <DialogHeader>
          <DialogTitle>QR Code for {item.material}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <QRCode
            value={`Material: ${item.material}, Supplier: ${item.supplier}`}
          />
          <Button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Print QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
