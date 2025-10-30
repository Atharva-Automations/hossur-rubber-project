'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function EditInwardDrawer({ open, onClose, item }: any) {
  const [formData, setFormData] = useState<any>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    if (item) {
      setFormData({
        materialName: item.materialName || item.material,
        supplierName: item.supplierName || item.supplier,
        quantity: item.quantity,
        bagWeight: item.bagWeight,
        storedAsWhole: item.storedAsWhole,
        mfgDate: new Date(item.mfgDate).toISOString().split('T')[0],
        expDate: new Date(item.expDate).toISOString().split('T')[0],
      });
    }
  }, [item]);

  const updateInward = useMutation({
    mutationFn: (data: any) => api.patch(`/inward/${item.id}`, data),
    onSuccess: () => {
      setShowSuccessModal(true);
      qc.invalidateQueries({ queryKey: ['inward'] });
      setTimeout(() => {
        setShowSuccessModal(false);
        onClose();
      }, 2000);
    },
  });

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    updateInward.mutate(formData);
  };

  const totalBags = formData.storedAsWhole
    ? 1
    : formData.quantity && formData.bagWeight
    ? Math.ceil(Number(formData.quantity) / Number(formData.bagWeight))
    : 0;

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg bg-white shadow-xl"
        >
          <SheetHeader>
            <SheetTitle>Edit Inward Material</SheetTitle>
          </SheetHeader>

          <div className="py-6 space-y-6">
            <div>
              <Label>Material Name</Label>
              <Input
                value={formData.materialName || ''}
                onChange={(e) => handleChange('materialName', e.target.value)}
              />
            </div>

            <div>
              <Label>Supplier Name</Label>
              <Input
                value={formData.supplierName || ''}
                onChange={(e) => handleChange('supplierName', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select
                  value={formData.unit || ''}
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
              <div>
                <Label>Bag Weight</Label>
                <Input
                  type="number"
                  value={formData.bagWeight || ''}
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
                  value={formData.mfgDate || ''}
                  onChange={(e) => handleChange('mfgDate', e.target.value)}
                />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.expDate || ''}
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
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={updateInward.isPending}
            >
              {updateInward.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <DialogHeader>
            <DialogTitle>✅ Material Updated Successfully!</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex justify-end">
            <Button onClick={() => setShowSuccessModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
