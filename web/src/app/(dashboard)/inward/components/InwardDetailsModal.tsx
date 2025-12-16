// src/app/inward/components/InwardDetailsModal.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Inward } from '@/types/inward';

interface InwardDetailsModalProps {
  open: boolean;
  onClose: () => void;
  item: Inward | null;
  onEdit: () => void;
}

export default function InwardDetailsModal({
  open,
  onClose,
  item,
}: InwardDetailsModalProps) {
  if (!item) return null;

  const totalBags = item.storedAsWhole
    ? 1
    : item.bagWeight
    ? Math.ceil(item.quantity / item.bagWeight)
    : 0;

  const createdAtDisplay = new Date(
    item.createdAt ?? item.mfgDate
  ).toLocaleDateString();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-lg shadow-xl border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Inward Entry Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-y-3 mt-3 text-sm">
          <div className="font-medium text-gray-600">ID</div>
          <div className="text-gray-900">#{item.id}</div>

          <div className="font-medium text-gray-600">Material</div>
          <div className="text-gray-900">{item.materialName}</div>

          <div className="font-medium text-gray-600">Supplier</div>
          <div>{item.supplierName}</div>

          <div className="font-medium text-gray-600">Quantity</div>
          <div>
            {item.quantity} {item.unit}
          </div>

          <div className="font-medium text-gray-600">Bag Weight</div>
          <div>{item.bagWeight ? `${item.bagWeight} ${item.unit}` : '-'}</div>

          <div className="font-medium text-gray-600">Total Bags</div>
          <div>{totalBags}</div>

          <div className="font-medium text-gray-600">Mfg Date</div>
          <div>{new Date(item.mfgDate).toLocaleDateString()}</div>

          <div className="font-medium text-gray-600">Expiry Date</div>
          <div>{new Date(item.expDate).toLocaleDateString()}</div>

          <div className="font-medium text-gray-600">Entry Date</div>
          <div>{createdAtDisplay}</div>

          <div className="font-medium text-gray-600">Status</div>
          <div>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                item.status === 'Active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {item.status}
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
