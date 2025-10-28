'use client';

import { Button } from '@/components/ui/button';
import { Pencil, Trash2, QrCode } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import EditInwardDrawer from './EditInwardDrawer';
import QRPreviewModal from './QrPreviewModal';

export default function InwardActions({ item, onEdit, onDelete }: any) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  return (
    <div className="flex gap-2">
      {/* QR Print */}
      <Button
        variant="outline"
        size="icon"
        className="hover:bg-blue-50"
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
      <QRPreviewModal
        open={openQR}
        onClose={() => setOpenQR(false)}
        item={item}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
        <AlertDialogContent>
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
              onClick={() => {
                onDelete(item.id);
                setOpenDeleteConfirm(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
