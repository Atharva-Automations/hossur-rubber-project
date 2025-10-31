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
import { useMaterials, useSuppliers } from '@/hooks/useLookup';

export default function EditInwardDrawer({ open, onClose, item }: any) {
  const [formData, setFormData] = useState<any>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addNewMaterial, setAddNewMaterial] = useState(false);
  const [addNewSupplier, setAddNewSupplier] = useState(false);

  const qc = useQueryClient();

  const { data: materials = [], isLoading: loadingMaterials } = useMaterials();
  const { data: suppliers = [], isLoading: loadingSuppliers } = useSuppliers();

  useEffect(() => {
    if (item) {
      setFormData({
        materialName: item.materialName || item.material,
        supplierName: item.supplierName || item.supplier,
        quantity: item.quantity,
        unit: item.unit,
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
            {/* Material Name */}
            <div>
              <Label>Material Name</Label>
              {!addNewMaterial ? (
                <Select
                  value={formData.materialName || ''}
                  onValueChange={(v) => {
                    if (v === 'add-new') setAddNewMaterial(true);
                    else handleChange('materialName', v);
                  }}
                  disabled={loadingMaterials}
                >
                  <SelectTrigger className="bg-white mt-1">
                    <SelectValue
                      placeholder={
                        loadingMaterials ? 'Loading...' : 'Select material'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-md">
                    <SelectItem value="add-new">➕ Add New Material</SelectItem>
                    {materials.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Enter new material name"
                  value={formData.materialName || ''}
                  onChange={(e) => handleChange('materialName', e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            {/* Supplier Name */}
            <div>
              <Label>Supplier</Label>
              {!addNewSupplier ? (
                <Select
                  value={formData.supplierName || ''}
                  onValueChange={(v) => {
                    if (v === 'add-new') setAddNewSupplier(true);
                    else handleChange('supplierName', v);
                  }}
                  disabled={loadingSuppliers}
                >
                  <SelectTrigger className="bg-white mt-1">
                    <SelectValue
                      placeholder={
                        loadingSuppliers ? 'Loading...' : 'Select supplier'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-md">
                    <SelectItem value="add-new">➕ Add New Supplier</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Enter new supplier name"
                  value={formData.supplierName || ''}
                  onChange={(e) => handleChange('supplierName', e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            {/* Quantity + Unit + Bag Weight */}
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
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

            {/* Stored as Whole */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.storedAsWhole}
                onCheckedChange={(checked) =>
                  handleChange('storedAsWhole', !!checked)
                }
              />
              <Label>Stored as Whole?</Label>
            </div>

            {/* Dates */}
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
                  min={
                    formData.mfgDate || new Date().toISOString().split('T')[0]
                  }
                  value={formData.expDate || ''}
                  onChange={(e) => handleChange('expDate', e.target.value)}
                />
              </div>
            </div>

            {/* Total Bags */}
            <div>
              <Label>Total Bags</Label>
              <Input
                value={totalBags.toString()}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Footer */}
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
