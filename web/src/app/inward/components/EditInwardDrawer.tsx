'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

export default function EditInwardDrawer({
  open,
  onClose,
  item,
  onSubmit,
}: any) {
  const [formData, setFormData] = useState(item || {});

  useEffect(() => {
    setFormData(item);
  }, [item]);

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  if (!formData) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-white shadow-xl"
      >
        <SheetHeader>
          <SheetTitle>Edit Inward Material</SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-4">
          <div>
            <Label>Material Name</Label>
            <Input
              value={formData.material || ''}
              onChange={(e) => handleChange('material', e.target.value)}
            />
          </div>
          <div>
            <Label>Supplier</Label>
            <Input
              value={formData.supplier || ''}
              onChange={(e) => handleChange('supplier', e.target.value)}
            />
          </div>
          <div>
            <Label>Quantity (KG)</Label>
            <Input
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => handleChange('quantity', e.target.value)}
            />
          </div>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
