'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useMaterials, useSuppliers } from '@/hooks/useLookup';
import { useCreateInward } from '@/hooks/useInward';

import QrPreviewModal from '../components/QrPreviewModal';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
// import { toast } from '@/components/ui/use-toast';
import { Header, PageContainer, Card } from '@/components/global';
import { Plus } from 'lucide-react';

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

import { CreateInwardPayload } from '@/types/inward';
import {
  notifyValidationError,
  notifyInwardActionFailed,
} from '@/utils/notifications';

export default function AddInwardPage() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [savedInwardId, setSavedInwardId] = useState<number | null>(null);
  const [openNewMaterial, setOpenNewMaterial] = useState(false);
  const [openNewSupplier, setOpenNewSupplier] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');

  const { mutateAsync: createInward, isPending } = useCreateInward();

  const { data: materials = [] } = useMaterials();
  const { data: suppliers = [] } = useSuppliers();

  // Merge API data with locally added items
  // const allMaterials = [...new Set([...materials, ...addedMaterials])];
  // const allSuppliers = [...new Set([...suppliers, ...addedSuppliers])];

  // --------------------------------------------------
  // Form State
  // --------------------------------------------------
  const [formData, setFormData] = useState<CreateInwardPayload>({
    materialName: '',
    supplierName: '',
    quantity: 0,
    unit: 'KG',
    bagWeight: undefined,
    storedAsWhole: false,
    mfgDate: new Date().toISOString().split('T')[0],
    expDate: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateInwardPayload, string>>
  >({});

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------
  const validate = () => {
    const newErrors: Partial<Record<keyof CreateInwardPayload, string>> = {};

    if (!formData.materialName.trim())
      newErrors.materialName = 'Material name is required.';
    if (!formData.supplierName.trim())
      newErrors.supplierName = 'Supplier is required.';

    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity = 'Quantity must be greater than 0.';

    if (!formData.unit) newErrors.unit = 'Unit is required.';

    if (!formData.storedAsWhole) {
      if (!formData.bagWeight || formData.bagWeight <= 0)
        newErrors.bagWeight = 'Bag weight is required.';
    }

    if (!formData.mfgDate)
      newErrors.mfgDate = 'Manufacturing date is required.';
    if (!formData.expDate) newErrors.expDate = 'Expiry date is required.';
    if (formData.expDate && formData.mfgDate) {
      if (new Date(formData.expDate) <= new Date(formData.mfgDate)) {
        newErrors.expDate = 'Expiry must be after manufacturing date.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------
  // Handlers
  // --------------------------------------------------
  const handleChange = (key: keyof CreateInwardPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleAddMaterial = () => {
    if (newMaterialName.trim()) {
      const trimmedName = newMaterialName.trim();
      handleChange('materialName', trimmedName);
      setNewMaterialName('');
      setOpenNewMaterial(false);
    }
  };

  const handleAddSupplier = () => {
    if (newSupplierName.trim()) {
      const trimmedName = newSupplierName.trim();
      handleChange('supplierName', trimmedName);
      setNewSupplierName('');
      setOpenNewSupplier(false);
    }
  };

  const totalBags = formData.storedAsWhole
    ? 1
    : formData.quantity && formData.bagWeight
    ? Math.ceil(Number(formData.quantity) / Number(formData.bagWeight))
    : 0;

  // --------------------------------------------------
  // Form Submit
  // --------------------------------------------------
  const handleSubmit = async () => {
    if (!validate()) {
      notifyValidationError();
      return;
    }

    try {
      const res = await createInward(formData); // onSuccess toast handled by hook
      setSavedInwardId(res.data?.id || null);
      setShowSuccessModal(true);
    } catch (err) {
      notifyInwardActionFailed();
    }
  };

  return (
    <PageContainer>
      <Header
        title="Add New Inward Material"
        description="Register incoming materials from suppliers with batch details"
        icon="📦"
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <div className="space-y-6">
              {/* Material Name */}
              <div>
                <Label>
                  Material Name <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.materialName}
                  onValueChange={(v) => {
                    if (v === '__ADD_NEW__') {
                      setOpenNewMaterial(true);
                    } else {
                      handleChange('materialName', v);
                    }
                  }}
                >
                  <SelectTrigger
                    className={`bg-white mt-1 ${
                      errors.materialName ? 'border-red-500' : ''
                    }`}
                  >
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    {materials.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                    <SelectItem
                      value="__ADD_NEW__"
                      className="text-blue-600 font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <Plus size={16} />
                        Add New Material
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.materialName && (
                  <p className="text-red-600 text-xs">{errors.materialName}</p>
                )}
              </div>

              {/* Supplier */}
              <div>
                <Label>
                  Supplier <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.supplierName}
                  onValueChange={(v) => {
                    if (v === '__ADD_NEW__') {
                      setOpenNewSupplier(true);
                    } else {
                      handleChange('supplierName', v);
                    }
                  }}
                >
                  <SelectTrigger
                    className={`bg-white mt-1 ${
                      errors.supplierName ? 'border-red-500' : ''
                    }`}
                  >
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    {suppliers.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                    <SelectItem
                      value="__ADD_NEW__"
                      className="text-blue-600 font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <Plus size={16} />
                        Add New Supplier
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.supplierName && (
                  <p className="text-red-600 text-xs">{errors.supplierName}</p>
                )}
              </div>

              <Separator />

              {/* Quantity + Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    Total Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      handleChange('quantity', Number(e.target.value))
                    }
                    className={errors.quantity ? 'border-red-500' : ''}
                  />
                  {errors.quantity && (
                    <p className="text-red-600 text-xs">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <Label>
                    Unit <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(v) => handleChange('unit', v)}
                  >
                    <SelectTrigger
                      className={`bg-white ${
                        errors.unit ? 'border-red-500' : ''
                      }`}
                    >
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KG">Kilogram (KG)</SelectItem>
                      <SelectItem value="L">Litre (L)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.unit && (
                    <p className="text-red-600 text-xs">{errors.unit}</p>
                  )}
                </div>
              </div>

              {/* Bag Weight */}
              <div>
                <Label>
                  Bag Weight{' '}
                  {!formData.storedAsWhole && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                <Input
                  type="number"
                  value={formData.bagWeight || ''}
                  disabled={formData.storedAsWhole}
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
                  <p className="text-red-600 text-xs">{errors.bagWeight}</p>
                )}
              </div>

              {/* Stored as Whole */}
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.storedAsWhole}
                  onCheckedChange={(checked) =>
                    handleChange('storedAsWhole', Boolean(checked))
                  }
                />
                <Label>Stored as Whole?</Label>
              </div>

              <Separator />

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    Manufacturing Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.mfgDate}
                    onChange={(e) => handleChange('mfgDate', e.target.value)}
                    className={errors.mfgDate ? 'border-red-500' : ''}
                  />
                  {errors.mfgDate && (
                    <p className="text-red-600 text-xs">{errors.mfgDate}</p>
                  )}
                </div>

                <div>
                  <Label>
                    Expiry Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.expDate}
                    onChange={(e) => handleChange('expDate', e.target.value)}
                    className={errors.expDate ? 'border-red-500' : ''}
                  />
                  {errors.expDate && (
                    <p className="text-red-600 text-xs">{errors.expDate}</p>
                  )}
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

              {/* Save / Cancel */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => router.push('/inward')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isPending ? 'Saving...' : 'Save & Continue'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Summary Card */}
        <div>
          <Card>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Entry Summary</h3>
              <Separator />

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Material</p>
                  <p className="font-medium text-gray-900">
                    {formData.materialName || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Supplier</p>
                  <p className="font-medium text-gray-900">
                    {formData.supplierName || '—'}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-gray-600">Total Quantity</p>
                  <p className="font-medium text-gray-900">
                    {formData.quantity} {formData.unit}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Total Bags</p>
                  <p className="font-medium text-lg text-blue-600">
                    {totalBags}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-gray-600">Mfg. Date</p>
                  <p className="font-medium text-gray-900">
                    {formData.mfgDate || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Exp. Date</p>
                  <p className="font-medium text-gray-900">
                    {formData.expDate || '—'}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-800">
                  💡 A QR code will be generated after saving. You can print it
                  immediately.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-xl">
              ✓ Material Saved Successfully!
            </DialogTitle>
          </DialogHeader>

          <p className="text-gray-600 text-sm">
            Your inward entry has been registered. Would you like to print the
            QR code now?
          </p>

          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/inward');
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>

            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                setShowSuccessModal(false);
                setShowQRModal(true);
                router.push('/inward');
              }}
            >
              Print QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Modal */}
      {savedInwardId && (
        <QrPreviewModal
          open={showQRModal}
          onClose={setShowQRModal}
          inwardId={savedInwardId}
        />
      )}

      {/* Add New Material Modal */}
      <Dialog open={openNewMaterial} onOpenChange={setOpenNewMaterial}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Add New Material
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 font-medium">Material Name</Label>
              <Input
                type="text"
                placeholder="Enter material name"
                value={newMaterialName}
                onChange={(e) => setNewMaterialName(e.target.value)}
                className="mt-2 bg-white border-gray-200 text-gray-900"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddMaterial();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setNewMaterialName('');
                setOpenNewMaterial(false);
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddMaterial}
              disabled={!newMaterialName.trim()}
            >
              Add Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Supplier Modal */}
      <Dialog open={openNewSupplier} onOpenChange={setOpenNewSupplier}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Add New Supplier
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 font-medium">Supplier Name</Label>
              <Input
                type="text"
                placeholder="Enter supplier name"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                className="mt-2 bg-white border-gray-200 text-gray-900"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSupplier();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setNewSupplierName('');
                setOpenNewSupplier(false);
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddSupplier}
              disabled={!newSupplierName.trim()}
            >
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
