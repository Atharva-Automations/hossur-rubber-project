'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function QrPreviewModal({ open, onClose, inwardId }: any) {
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && inwardId) {
      setLoading(true);
      api
        .get(`/inward/${inwardId}/qrs`)
        .then((res) => setQrCodes(res.data))
        .finally(() => setLoading(false));
    }
  }, [open, inwardId]);

  const handlePrintSingle = (qrId: string) => {
    const canvas = document
      .querySelector(`#qr-${qrId}`)
      ?.querySelector('canvas') as HTMLCanvasElement | null;

    if (!canvas) return;

    const dataUrl = canvas.toDataURL();

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head><title>Print QR</title></head>
        <body style="text-align:center; font-family: Arial;">
          <img src="${dataUrl}" style="width:180px;" />
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head><title>Print All QRs</title></head>
        <body style="text-align:center; font-family: Arial; display:flex; flex-wrap:wrap; gap:20px; justify-content:center;">
    `);

    qrCodes.forEach((qr) => {
      const canvas = document
        .querySelector(`#qr-${qr.qrId}`)
        ?.querySelector('canvas') as HTMLCanvasElement | null;

      if (canvas) {
        const dataUrl = canvas.toDataURL();
        printWindow.document.write(`
          <div style="margin:10px;">
            <img src="${dataUrl}" style="width:150px;" />
            <div style="font-size:14px; margin-top:5px;">${qr.label}</div>
          </div>
        `);
      }
    });

    printWindow.document.write(`
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-white shadow-xl rounded-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            QR Print Preview
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {loading && (
            <p className="text-center py-6 text-gray-500">Loading...</p>
          )}

          {!loading && qrCodes.length === 0 && (
            <p className="text-center py-6 text-gray-500">No QR codes found.</p>
          )}

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

        <div className="flex justify-center gap-4 mt-6">
          <Button variant="outline" onClick={() => onClose(false)}>
            Close
          </Button>
          {qrCodes.length > 0 && (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handlePrintAll}
            >
              Print All
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
