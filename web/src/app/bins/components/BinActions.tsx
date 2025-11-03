'use client';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

export default function BinActions({ item, onEdit, onDelete }: any) {
  return (
    <div className="flex justify-end gap-2">
      <Button size="icon" variant="ghost" onClick={() => onEdit?.(item)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" onClick={onDelete}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}
