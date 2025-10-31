'use client';

import { Button } from '@/components/ui/button';
import { Pencil, Trash2, QrCode } from 'lucide-react';

interface OutwardActionsProps {
  item: any;
  onEdit: (updated: any) => void;
  onDelete: (id: number) => void;
  onQr: (id: number) => void;
}

export default function OutwardActions({
  item,
  onEdit,
  onDelete,
  onQr,
}: OutwardActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <Button size="icon" variant="ghost" onClick={() => onQr(item.id)}>
        <QrCode className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" onClick={() => onEdit(item)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" onClick={() => onDelete(item.id)}>
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
}
