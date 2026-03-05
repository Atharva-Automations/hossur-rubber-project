'use client';

import api from '@/lib/api';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

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
  const qc = useQueryClient();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('🔑 KEY PRESSED:', e.key);
    if (e.key === 'Enter' && !loading) {
      console.log('⏎ ENTER key detected - triggering scan');
      handleScan();
    }
  };

  const handleScan = async () => {
    console.log('\n========== 🔍 QR SCAN INITIATED ==========');
    console.log('📱 QR Input Value:', qrInput);
    console.log('📦 Outward ID:', outwardId);
    console.log('⏱️  Timestamp:', new Date().toISOString());

    if (!qrInput.trim()) {
      console.log('❌ QR input is empty or whitespace only');
      toast({
        title: 'Missing Input',
        description: 'Please enter or scan a QR ID before submitting.',
        variant: 'destructive',
      });
      return;
    }

    console.log('✅ QR input validation passed');
    console.log('🔄 Starting API call...');
    try {
      setLoading(true);

      console.log('📤 API Request Payload:', {
        outwardId,
        qrId: qrInput.trim(),
      });

      const res = await api.post('/outward/scan-qr', {
        outwardId,
        qrId: qrInput.trim(),
      });

      console.log('📨 API Response Received:', res.data);
      const { message, scannedBags, totalBags, status } = res.data;
      console.log(
        `✅ Scan Successful - Bags: ${scannedBags}/${totalBags}, Status: ${status}`
      );

      setScannedCount(scannedBags);
      setTotalBags(totalBags);

      // Refresh outward data and analytics so UI reflects scanned status
      qc.invalidateQueries({ queryKey: ['outward'] });
      qc.invalidateQueries({ queryKey: ['outwardAnalytics'] });

      // Show appropriate toast based on status
      if (status === 'Completed') {
        toast({
          title: '✅ All Bags Scanned',
          description: `All ${totalBags} bags have been successfully scanned for outward!`,
        });
      } else {
        toast({
          title: '✓ Bag Scanned',
          description: `${scannedBags} of ${totalBags} bags scanned. ${message}`,
        });
      }

      if (status === 'Completed') {
        setQrInput('');
        setTimeout(() => onClose(false), 1500);
      } else {
        setQrInput('');
      }
    } catch (error: unknown) {
      console.error('❌ API CALL FAILED:', error);
      console.error('Error Details:', {
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
        message: (error as any)?.message,
      });

      // Extract error message more reliably
      const errMsg =
        (error as any)?.response?.data?.message?.toLowerCase() || '';
      const statusCode = (error as any)?.response?.status;

      console.log('⚠️  Error Message (lowercase):', errMsg);
      console.log('🔴 Status Code:', statusCode);

      let userMessage = 'Unexpected error occurred. Please try again.';
      let title = 'Scan Error';

      if (errMsg.includes('not found') || statusCode === 404) {
        userMessage = 'Invalid QR ID – no such bag exists in inventory.';
        title = '❌ QR Not Found';
      } else if (
        errMsg.includes('already scanned') ||
        errMsg.includes('already issued')
      ) {
        userMessage = 'This bag is already scanned for outward dispatch.';
        title = '⚠️ Already Scanned';
      } else if (errMsg.includes('consumed')) {
        userMessage = 'This bag is already used in production.';
        title = '⚠️ Already Used';
      } else if (errMsg.includes('belongs to')) {
        userMessage =
          'This QR belongs to a different material than this outward entry.';
        title = '❌ Wrong Material';
      } else if (errMsg.includes('invalid qr') || errMsg.includes('invalid')) {
        userMessage =
          'Invalid or unreadable QR code. Please check and try again.';
        title = '❌ Invalid QR';
      } else if (errMsg.includes('state')) {
        userMessage = `Invalid bag state. ${
          (error as any)?.response?.data?.message
        }`;
        title = '⚠️ Invalid Bag State';
      }

      toast({
        title,
        description: userMessage,
        variant: 'destructive',
      });
    } finally {
      console.log('🏁 Scan operation completed');
      console.log('========== END QR SCAN ==========\n');
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
            placeholder="Enter QR ID (e.g., INW-00001-0001)"
            value={qrInput}
            onChange={(e) => {
              const newValue = e.target.value;
              console.log('📝 Input changed:', newValue);
              console.log('📝 Input length:', newValue.length);
              setQrInput(newValue);
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoFocus
          />
          {totalBags !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm font-medium text-blue-900">
                Progress: {scannedCount} / {totalBags} bags scanned
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      totalBags > 0 ? (scannedCount / totalBags) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
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
