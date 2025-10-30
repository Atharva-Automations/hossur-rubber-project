'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useCreateInward } from '@/hooks/useInward';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AddInwardPage() {
  const router = useRouter();
  const { mutateAsync: createInward, isPending } = useCreateInward();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    material: '',
    newMaterial: '',
    supplier: '',
    quantity: '',
    bagWeight: '',
    storedAsWhole: false,
    mfgDate: new Date().toISOString().split('T')[0],
    expDate: '',
  });

  const [addNew, setAddNew] = useState(false);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const materialsList = [
    'Zinc Oxide',
    'Carbon Black',
    'Stearic Acid',
    'Sulphur',
  ];

  const handleSubmit = async () => {
    const {
      material,
      newMaterial,
      supplier,
      quantity,
      bagWeight,
      storedAsWhole,
      mfgDate,
      expDate,
    } = formData;
    const selectedMaterial = addNew ? newMaterial : material;

    if (!selectedMaterial || !supplier || !quantity || !mfgDate || !expDate) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields before saving.',
      });
      return;
    }

    const payload = {
      materialName: selectedMaterial,
      supplierName: supplier,
      quantity: Number(quantity),
      bagWeight: storedAsWhole ? 0 : Number(bagWeight),
      storedAsWhole,
      unit: 'KG',
      mfgDate,
      expDate,
    };

    try {
      await createInward(payload);
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to save material. Please try again.',
      });
    }
  };

  const totalBags = formData.storedAsWhole
    ? 1
    : formData.quantity && formData.bagWeight
    ? Math.ceil(Number(formData.quantity) / Number(formData.bagWeight))
    : 0;

  return (
    <DashboardLayout>
      <div className="bg-white shadow-sm rounded-lg p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Add New Inward Material</h2>

        <div className="space-y-6">
          {/* Material selection */}
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
              <Input
                placeholder="Enter new material name"
                value={formData.newMaterial}
                onChange={(e) => handleChange('newMaterial', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <Separator />

          <div>
            <Label>Supplier Name</Label>
            <Input
              placeholder="Enter supplier name"
              value={formData.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Quantity (KG)</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
              />
            </div>
            <div>
              <Label>Bag Weight (KG)</Label>
              <Input
                type="number"
                value={formData.bagWeight}
                onChange={(e) => handleChange('bagWeight', e.target.value)}
                disabled={formData.storedAsWhole}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.storedAsWhole}
              onCheckedChange={(checked) =>
                handleChange('storedAsWhole', !!checked)
              }
            />
            <Label>Stored as Whole?</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Manufacturing Date</Label>
              <Input
                type="date"
                value={formData.mfgDate}
                onChange={(e) => handleChange('mfgDate', e.target.value)}
              />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={formData.expDate}
                onChange={(e) => handleChange('expDate', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Total Bags</Label>
            <Input
              value={totalBags.toString()}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.push('/inward')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <DialogHeader>
            <DialogTitle>✅ Material Saved Successfully!</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-gray-700">
            <p>Your material has been added to the database.</p>
            <p className="text-sm text-gray-500 mt-1">
              You can now print QR codes for the bags.
            </p>
          </div>
          <DialogFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/inward');
              }}
            >
              Close
            </Button>

            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => alert('QR Printing feature coming soon!')}
            >
              Print QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
