'use client';

import { useState } from 'react';
import { Plus, Printer } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function AddInwardDrawer({
  onSubmit,
}: {
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    material: '',
    newMaterial: '',
    supplier: '',
    quantity: '',
    bagWeight: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [addNew, setAddNew] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = () => {
    const { material, supplier, quantity, bagWeight, newMaterial } = formData;
    const selectedMaterial = addNew ? newMaterial : material;
    if (!selectedMaterial || !supplier || !quantity || !bagWeight) {
      alert('Please fill in all required fields.');
      return;
    }
    const totalBags = Math.ceil(Number(quantity) / Number(bagWeight));
    onSubmit({ ...formData, material: selectedMaterial, totalBags });
  };

  const materialsList = [
    'Zinc Oxide',
    'Carbon Black',
    'Stearic Acid',
    'Sulphur',
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus size={16} />
          Add Inward
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-white shadow-xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold text-gray-800">
            Add New Inward Material
          </SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Material Selection Section */}
          <div>
            <Label>Material Name</Label>
            {!addNew ? (
              <Select
                value={formData.material}
                onValueChange={(v) => {
                  if (v === 'add-new') setAddNew(true);
                  else handleChange('material', v);
                }}
              >
                <SelectTrigger className="bg-white mt-1">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-md">
                  {materialsList.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                  <SelectItem value="add-new">➕ Add New Material</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 space-y-2 mt-2">
                <Label className="text-sm font-medium text-gray-700">
                  New Material Name
                </Label>
                <Input
                  placeholder="Enter new material name"
                  value={formData.newMaterial}
                  onChange={(e) => handleChange('newMaterial', e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline" onClick={() => setAddNew(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      if (!formData.newMaterial.trim()) {
                        alert('Please enter a material name.');
                        return;
                      }
                      handleChange('material', formData.newMaterial);
                      setAddNew(false);
                    }}
                  >
                    Save Material
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Supplier Info */}
          <div>
            <Label>Supplier Name</Label>
            <Input
              placeholder="Enter supplier name"
              value={formData.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Total Quantity (KG)</Label>
              <Input
                type="number"
                placeholder="e.g. 50"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Bag Weight (KG)</Label>
              <Input
                type="number"
                placeholder="e.g. 5"
                value={formData.bagWeight}
                onChange={(e) => handleChange('bagWeight', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <SheetFooter className="flex justify-between mt-4">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              Save
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => alert('QR print functionality coming soon')}
            >
              <Printer size={16} />
              Print QR
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
