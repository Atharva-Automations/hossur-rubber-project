'use client';

import { useState } from 'react';
import { Pencil, Trash2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import EditInwardDrawer from './EditInwardDrawer';
import InwardDetailsModal from './InwardDetailsModal';
import QrPreviewModal from './QrPreviewModal';
import { useDeleteInward } from '@/hooks/useInward';
import { Inward } from '@/types/inward';

interface InwardActionsProps {
  item: Inward;
}

export default function InwardActions({ item }: InwardActionsProps) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const { mutate: deleteInward } = useDeleteInward();

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpenQR(true)}
          className="border-blue-200 hover:bg-blue-50"
          title="Preview QR"
        >
          <QrCode className="w-4 h-4 text-blue-600" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpenEdit(true)}
          className="border-amber-200 hover:bg-amber-50"
          title="Edit Entry"
        >
          <Pencil className="w-4 h-4 text-amber-600" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpenDeleteConfirm(true)}
          className="border-red-200 hover:bg-red-50"
          title="Delete Entry"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      </div>

      {/* Details Modal */}
      <InwardDetailsModal
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        item={item}
        onEdit={() => {
          setOpenDetails(false);
          setOpenEdit(true);
        }}
      />

      {/* Edit Drawer */}
      <EditInwardDrawer
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        item={item}
      />

      {/* QR Preview Modal */}
      <QrPreviewModal
        open={openQR}
        onClose={() => setOpenQR(false)}
        inwardId={item.id}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
        <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-lg font-semibold">
              Delete Inward Entry
            </DialogTitle>
          </DialogHeader>

          <p className="text-gray-600 text-sm">
            Are you sure you want to delete this inward entry?
            <br />
            <br />
            <strong>{item.materialName}</strong> from{' '}
            <strong>{item.supplierName}</strong> ({item.quantity} {item.unit})
          </p>

          <p className="text-gray-500 text-xs">This action cannot be undone.</p>

          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpenDeleteConfirm(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>

            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                deleteInward(item.id);
                setOpenDeleteConfirm(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
