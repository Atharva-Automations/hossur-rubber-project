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
import { toast } from 'sonner'; // or your toast library
import { Loader2 } from 'lucide-react';

export default function QrPreviewModal({ open, onClose, inwardId }: any) {
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (open && inwardId) {
      setLoading(true);
      api
        .get(`/inward/${inwardId}/qrs`)
        .then((res) => setQrCodes(res.data))
        .finally(() => setLoading(false));
    }
  }, [open, inwardId]);

  /**
   * Print single QR label to TSC printer
   */
  const handlePrintSingle = async (qrId: string) => {
    try {
      setPrinting(true);
      await api.post('/printer/print', { qrId });
      toast.success('Label printed successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Print failed');
      console.error('Print error:', error);
    } finally {
      setPrinting(false);
    }
  };

  /**
   * Print all QR labels one by one
   */
  const handlePrintAll = async () => {
    // console.log('Printing all labels:', qrCodes);
    try {
      setPrinting(true);
      setPrintProgress({ current: 0, total: qrCodes.length });

      // Send batch request to backend
      await api.post('/printer/print-batch', {
        qrCodes: qrCodes.map((qr) => ({ qrId: qr.qrId })),
      });

      toast.success(`${qrCodes.length} labels printed successfully`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Batch print failed');
      console.error('Batch print error:', error);
    } finally {
      setPrinting(false);
      setPrintProgress({ current: 0, total: 0 });
    }
  };

  /**
   * Test printer connection
   */
  const handleTestPrinter = async () => {
    try {
      const response = await api.get('/printer/status');
      if (response.data.connected) {
        console.log('Printer status:', response.data);
        toast.success('Printer is connected and ready');
      } else {
        console.log('Printer status:', response.data);
        toast.error('Printer not connected: ' + response.data.error);
      }
    } catch (error) {
      toast.error('Cannot connect to printer service');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-white shadow-xl rounded-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            QR Print Preview
          </DialogTitle>
        </DialogHeader>

        {/* Printer Status */}
        <div className="px-4 py-2 bg-gray-50 rounded-lg flex justify-between items-center">
          <span className="text-sm text-gray-600">
            TSC TA220 Thermal Printer
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestPrinter}
            disabled={printing}
          >
            Test Connection
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {loading && (
            <p className="text-center py-6 text-gray-500">Loading...</p>
          )}

          {!loading && qrCodes.length === 0 && (
            <p className="text-center py-6 text-gray-500">No QR codes found.</p>
          )}

          {/* Print Progress */}
          {printing && printProgress.total > 0 && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Printing {printProgress.current} of {printProgress.total}...
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center mt-6">
            {qrCodes.map((qr) => (
              <div
                key={qr.qrId}
                id={`qr-${qr.qrId}`}
                className="flex flex-col items-center border rounded-lg p-3 shadow-sm"
              >
                <QRCode value={qr.qrId} size={100} />
                <p className="mt-2 font-mono text-xs text-gray-700 break-all text-center">
                  {qr.qrId}
                </p>
                <p className="text-xs text-gray-500">Bag #{qr.bagNo}</p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => handlePrintSingle(qr.qrId)}
                  disabled={printing}
                >
                  {printing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Print'
                  )}
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
              disabled={printing}
            >
              {printing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Printing...
                </>
              ) : (
                `Print All (${qrCodes.length})`
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
