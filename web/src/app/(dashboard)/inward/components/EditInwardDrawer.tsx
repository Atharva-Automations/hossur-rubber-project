// src/app/inward/components/EditInwardDrawer.tsx
'use client';

import { useEffect, useState } from 'react';
import { Inward, UpdateInwardPayload } from '@/types/inward';
import { useUpdateInward } from '@/hooks/useInward';
import { useMaterials, useSuppliers } from '@/hooks/useLookup';

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

interface EditInwardDrawerProps {
  open: boolean;
  onClose: () => void;
  item: Inward | null;
}

type InwardErrors = Partial<Record<keyof Inward, string>>;

export default function EditInwardDrawer({
  open,
  onClose,
  item,
}: EditInwardDrawerProps) {
  const [formData, setFormData] = useState<UpdateInwardPayload>({});
  const [errors, setErrors] = useState<InwardErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: materials = [] } = useMaterials();
  const { data: suppliers = [] } = useSuppliers();

  const updateInward = useUpdateInward(item?.id ?? 0);

  // Load item into form when opening
  useEffect(() => {
    if (item && open) {
      setFormData({
        materialName: item.materialName,
        supplierName: item.supplierName,
        batchNumber: item.batchNumber ?? undefined,
        quantity: item.quantity,
        unit: item.unit,
        bagWeight: item.bagWeight ?? undefined,
        storedAsWhole: item.storedAsWhole,
        mfgDate: item.mfgDate.split('T')[0] ?? item.mfgDate,
        expDate: item.expDate.split('T')[0] ?? item.expDate,
      });
      setErrors({});
    }
  }, [item, open]);

  const handleChange = (
    key: keyof UpdateInwardPayload,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key as keyof Inward]: undefined }));
  };

  const validate = () => {
    const e: InwardErrors = {};

    if (!formData.materialName?.trim())
      e.materialName = 'Material is required.';
    if (!formData.supplierName?.trim())
      e.supplierName = 'Supplier is required.';
    if (!formData.quantity || Number(formData.quantity) <= 0)
      e.quantity = 'Quantity must be greater than 0.';
    if (!formData.unit) e.unit = 'Unit is required.';

    if (!formData.storedAsWhole) {
      if (!formData.bagWeight || Number(formData.bagWeight) <= 0) {
        e.bagWeight = 'Bag weight must be greater than 0.';
      }
    }

    if (!formData.mfgDate) e.mfgDate = 'Manufacturing date is required.';
    if (!formData.expDate) e.expDate = 'Expiry date is required.';

    if (formData.mfgDate && formData.expDate) {
      if (new Date(formData.expDate) < new Date(formData.mfgDate)) {
        e.expDate = 'Expiry cannot be before manufacturing date.';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!item) return;
    if (!validate()) return;

    updateInward.mutate(formData, {
      onSuccess: () => {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          onClose();
        }, 1200);
      },
    });
  };

  const totalBags = formData.storedAsWhole
    ? 1
    : formData.quantity && formData.bagWeight
    ? Math.ceil(Number(formData.quantity) / Number(formData.bagWeight))
    : 0;

  if (!item) return null;

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
            {/* Material */}
            <div>
              <Label>Material Name</Label>
              <select
                className={`mt-1 w-full border rounded px-2 py-1 bg-white ${
                  errors.materialName ? 'border-red-500' : ''
                }`}
                value={formData.materialName ?? ''}
                onChange={(e) => handleChange('materialName', e.target.value)}
              >
                <option value="">Select material</option>
                {materials.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {errors.materialName && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.materialName}
                </p>
              )}
            </div>

            {/* Supplier */}
            <div>
              <Label>Supplier</Label>
              <select
                className={`mt-1 w-full border rounded px-2 py-1 bg-white ${
                  errors.supplierName ? 'border-red-500' : ''
                }`}
                value={formData.supplierName ?? ''}
                onChange={(e) => handleChange('supplierName', e.target.value)}
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.supplierName && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.supplierName}
                </p>
              )}
            </div>

            {/* Batch Number */}
            <div>
              <Label>Batch Number</Label>
              <Input
                value={formData.batchNumber ?? ''}
                onChange={(e) => handleChange('batchNumber', e.target.value)}
              />
            </div>

            {/* Quantity + Unit + Bag weight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity ?? ''}
                  onChange={(e) =>
                    handleChange('quantity', Number(e.target.value))
                  }
                  className={errors.quantity ? 'border-red-500' : ''}
                />
                {errors.quantity && (
                  <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>
                )}
              </div>

              <div>
                <Label>Unit</Label>
                <select
                  className={`mt-1 w-full border rounded px-2 py-1 bg-white ${
                    errors.unit ? 'border-red-500' : ''
                  }`}
                  value={formData.unit ?? ''}
                  onChange={(e) => handleChange('unit', e.target.value)}
                >
                  <option value="">Select unit</option>
                  <option value="KG">Kilogram (KG)</option>
                  <option value="L">Litre (L)</option>
                </select>
                {errors.unit && (
                  <p className="text-xs text-red-600 mt-1">{errors.unit}</p>
                )}
              </div>

              <div>
                <Label>Bag Weight</Label>
                <Input
                  type="number"
                  disabled={formData.storedAsWhole}
                  value={formData.bagWeight ?? ''}
                  onChange={(e) =>
                    handleChange('bagWeight', Number(e.target.value))
                  }
                  className={
                    !formData.storedAsWhole && errors.bagWeight
                      ? 'border-red-500'
                      : ''
                  }
                />
                {!formData.storedAsWhole && errors.bagWeight && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.bagWeight}
                  </p>
                )}
              </div>
            </div>

            {/* Stored as whole */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.storedAsWhole ?? false}
                onCheckedChange={(checked) =>
                  handleChange('storedAsWhole', Boolean(checked))
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
                  value={formData.mfgDate ?? ''}
                  onChange={(e) => handleChange('mfgDate', e.target.value)}
                  className={errors.mfgDate ? 'border-red-500' : ''}
                />
                {errors.mfgDate && (
                  <p className="text-xs text-red-600 mt-1">{errors.mfgDate}</p>
                )}
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.expDate ?? ''}
                  onChange={(e) => handleChange('expDate', e.target.value)}
                  className={errors.expDate ? 'border-red-500' : ''}
                />
                {errors.expDate && (
                  <p className="text-xs text-red-600 mt-1">{errors.expDate}</p>
                )}
              </div>
            </div>

            {/* Total bags */}
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
        <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-lg border p-6">
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
