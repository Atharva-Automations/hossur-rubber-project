'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Outward } from '@/types/outward';

interface OutwardDetailsModalProps {
  open: boolean;
  onClose: () => void;
  item: Outward | null;
}

export default function OutwardDetailsModal({
  open,
  onClose,
  item,
}: OutwardDetailsModalProps) {
  if (!item) return null;

  const totalBags = item.qrScanStatus?.totalBags ?? item.items?.length ?? 0;
  const createdAtDisplay = new Date(item.createdAt ?? '').toLocaleDateString();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-lg shadow-xl border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Outward Entry Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-y-3 mt-3 text-sm">
          <div className="font-medium text-gray-600">ID</div>
          <div className="text-gray-900">#{item.id}</div>

          <div className="font-medium text-gray-600">Material</div>
          <div className="text-gray-900">{item.materialName}</div>

          <div className="font-medium text-gray-600">Outward No.</div>
          <div>{item.outwardNumber ?? '-'}</div>

          <div className="font-medium text-gray-600">Quantity</div>
          <div className="text-gray-900">{item.quantity ?? 0}</div>

          <div className="font-medium text-gray-600">Total Bags</div>
          <div>{totalBags}</div>

          <div className="font-medium text-gray-600">Created</div>
          <div>{createdAtDisplay || '-'}</div>

          <div className="font-medium text-gray-600">Status</div>
          <div>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                item.status === 'Completed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {item.status ?? '-'}
            </span>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
