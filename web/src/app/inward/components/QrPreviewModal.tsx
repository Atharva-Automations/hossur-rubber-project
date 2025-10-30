'use client';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import QRCode from 'react-qr-code';
import api from '@/lib/api';

export default function QrPreviewModal({ open, onClose, inwardId }: any) {
  const [qrCodes, setQrCodes] = useState<any[]>([]);

  useEffect(() => {
    if (inwardId && open) {
      api.get(`/inward/${inwardId}/qrs`).then((res) => setQrCodes(res.data));
    }
  }, [inwardId, open]);

  const handlePrintSingle = (qrId: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Print QR</title></head>
          <body style="text-align:center; font-family: Arial;">
            <h3>${qrId}</h3>
            <div style="display:inline-block; padding:20px;">
              <img src="${document
                .querySelector(`#qr-${qrId}`)
                ?.querySelector('canvas')
                ?.toDataURL()}" />
            </div>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handlePrintAll = () => window.print();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-white shadow-xl rounded-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            QR Print Modal
          </DialogTitle>
        </DialogHeader>

        {/* QR grid with scrollable container */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center mt-6">
            {qrCodes.map((qr) => (
              <div
                key={qr.qrId}
                id={`qr-${qr.qrId}`}
                className="flex flex-col items-center border rounded-lg p-3 shadow-sm"
              >
                <QRCode value={qr.qrId} size={100} />
                <p className="mt-2 font-medium text-gray-700">{qr.label}</p>
                <p className="text-sm text-gray-500">Bag #{qr.bagNo}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handlePrintSingle(qr.qrId)}
                >
                  Print
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <Button variant="outline" onClick={() => onClose(false)}>
            Close
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handlePrintAll}
          >
            Print All
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
