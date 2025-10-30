'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';
import { useCreateInward } from '@/hooks/useInward';

import DashboardLayout from '@/components/layout/DashboardLayout';
import QrPreviewModal from '../components/QrPreviewModal';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AddInwardPage() {
  const router = useRouter();
  const [addNew, setAddNew] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [savedInwardId, setSavedInwardId] = useState<number | null>(null);

  const { mutateAsync: createInward, isPending } = useCreateInward();

  const materialsList = [
    'Zinc Oxide',
    'Carbon Black',
    'Stearic Acid',
    'Sulphur',
  ];

  const [formData, setFormData] = useState({
    material: '',
    newMaterial: '',
    supplier: '',
    quantity: '',
    bagWeight: '',
    storedAsWhole: false,
    unit: 'KG',
    mfgDate: new Date().toISOString().split('T')[0],
    expDate: '',
  });

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

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
      unit: formData.unit,
      mfgDate,
      expDate,
    };

    try {
      const res = await createInward(payload);
      setSavedInwardId(res.data?.id || null);
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

          {/* Supplier Name */}
          <div>
            <Label>Supplier Name</Label>
            <Input
              placeholder="Enter supplier name"
              value={formData.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Total Quantity */}
            <div>
              <Label>Total Quantity</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
              />
            </div>

            {/* Unit */}
            <div>
              <Label>Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(v) => handleChange('unit', v)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="KG">Kilogram (KG)</SelectItem>
                  <SelectItem value="L">Litre (L)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bag Weight */}
            <div>
              <Label>Bag Weight</Label>
              <Input
                type="number"
                value={formData.bagWeight}
                onChange={(e) => handleChange('bagWeight', e.target.value)}
                disabled={formData.storedAsWhole}
              />
            </div>
          </div>

          {/* Stored as whole checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.storedAsWhole}
              onCheckedChange={(checked) =>
                handleChange('storedAsWhole', !!checked)
              }
            />
            <Label>Stored as Whole?</Label>
          </div>

          {/* Manufacturing date */}
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

          {/* No. of bags(automatic) */}
          <div>
            <Label>Total Bags</Label>
            <Input
              value={totalBags.toString()}
              readOnly
              className="bg-gray-50"
            />
          </div>

          {/* Save and canel button */}
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

      {/* Success Modal */}
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
              onClick={() => {
                setShowSuccessModal(false);
                setShowQRModal(true);
                setTimeout(() => router.push('/inward'), 2000);
              }}
            >
              Print QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {savedInwardId && (
        <QrPreviewModal
          open={showQRModal}
          onClose={setShowQRModal}
          inwardId={savedInwardId}
        />
      )}
    </DashboardLayout>
  );
}
