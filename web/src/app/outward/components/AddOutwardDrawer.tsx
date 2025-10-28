'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

export default function AddOutwardDrawer() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    material: '',
    quantity: '',
    unit: 'KG',
    destination: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = () => {
    console.log('Outward Submitted:', form);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>Add Outward</Button>
      </DrawerTrigger>
      <DrawerContent className="p-6 space-y-4">
        <DrawerHeader>
          <DrawerTitle>Add New Outward Entry</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-3">
          <Select onValueChange={(value) => handleChange('material', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Zinc Oxide">Zinc Oxide</SelectItem>
              <SelectItem value="Carbon Black">Carbon Black</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
          />

          <Input
            placeholder="Destination / Line"
            value={form.destination}
            onChange={(e) => handleChange('destination', e.target.value)}
          />

          <Button onClick={handleSubmit} className="w-full">
            Save
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
