'use client';

import { useState } from 'react';
import { Pencil, Trash2, QrCode } from 'lucide-react';
import EditInwardDrawer from './EditInwardDrawer';
import QrPreviewModal from './QrPreviewModal';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useDeleteInward } from '@/hooks/useInward';

export default function InwardActions({ item, onEdit }: any) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const { mutate: deleteInward } = useDeleteInward();

  const handleDelete = () => {
    deleteInward(item.id);
    setOpenDeleteConfirm(false);
  };

  return (
    <div className="flex gap-2">
      {/* QR Print */}
      <Button
        variant="outline"
        disabled={item.status === 'Expired'}
        title={
          item.status === 'Expired' ? 'Cannot print for expired batch' : ''
        }
        onClick={() => setOpenQR(true)}
      >
        <QrCode className="w-4 h-4" />
      </Button>

      {/* Edit */}
      <Button
        variant="outline"
        size="icon"
        className="hover:bg-yellow-50"
        onClick={() => setOpenEdit(true)}
      >
        <Pencil className="w-4 h-4" />
      </Button>

      {/* Delete */}
      <Button
        variant="outline"
        size="icon"
        className="hover:bg-red-50"
        onClick={() => setOpenDeleteConfirm(true)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {/* Edit Drawer */}
      <EditInwardDrawer
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        item={item}
        onSubmit={onEdit}
      />

      {/* QR Modal */}
      <QrPreviewModal open={openQR} onClose={setOpenQR} inwardId={item.id} />

      {/* Delete Confirmation */}
      <AlertDialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
        <AlertDialogContent className="bg-white text-gray-800 shadow-xl rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this material entry?</AlertDialogTitle>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone.
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
