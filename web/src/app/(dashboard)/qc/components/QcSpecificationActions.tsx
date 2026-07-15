'use client';

import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

export default function QcSpecificationActions({ onEdit, onDelete }: Props) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>
      <Button variant="outline" size="sm" onClick={onDelete}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  );
}
