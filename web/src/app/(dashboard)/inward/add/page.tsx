'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useMaterials, useSuppliers } from '@/hooks/useLookup';
import { useCreateInward } from '@/hooks/useInward';

import QrPreviewModal from '../components/QrPreviewModal';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Header, PageContainer, Card } from '@/components/global';

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

  const { mutateAsync: createInward, isPending } = useCreateInward();

  const { data: materials = [] } = useMaterials();
  const { data: suppliers = [] } = useSuppliers();

  const materialWrapperRef = useRef<HTMLDivElement>(null);
  const supplierWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        materialWrapperRef.current &&
        !materialWrapperRef.current.contains(event.target as Node)
      ) {
        setShowMaterialList(false);
        setActiveMaterialIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        supplierWrapperRef.current &&
        !supplierWrapperRef.current.contains(event.target as Node)
      ) {
        setShowSupplierList(false);
        setActiveSupplierIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --------------------------------------------------
  // Form State
  // --------------------------------------------------
  const [formData, setFormData] = useState<CreateInwardPayload>({
    materialName: '',
    supplierName: '',
    batchNumber: '',
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

  const [showMaterialList, setShowMaterialList] = useState(false);
  const [activeMaterialIndex, setActiveMaterialIndex] = useState(-1);

  const filteredMaterials = materials.filter((m) =>
    m.toLowerCase().includes(formData.materialName.toLowerCase())
  );

  const [showSupplierList, setShowSupplierList] = useState(false);
  const [activeSupplierIndex, setActiveSupplierIndex] = useState(-1);

  const filteredSuppliers = suppliers.filter((s) =>
    s.toLowerCase().includes(formData.supplierName.toLowerCase())
  );

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
              <div ref={materialWrapperRef} className="relative">
                <Label>
                  Material Name <span className="text-red-500">*</span>
                </Label>

                <Input
                  value={formData.materialName}
                  placeholder="Type material name..."
                  autoComplete="off"
                  onChange={(e) => {
                    handleChange('materialName', e.target.value);
                    setShowMaterialList(true);
                    setActiveMaterialIndex(-1);
                  }}
                  onFocus={() => {
                    if (formData.materialName) setShowMaterialList(true);
                  }}
                  onKeyDown={(e) => {
                    if (!showMaterialList || filteredMaterials.length === 0)
                      return;

                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setActiveMaterialIndex((prev) =>
                        prev < filteredMaterials.length - 1 ? prev + 1 : prev
                      );
                    }

                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setActiveMaterialIndex((prev) =>
                        prev > 0 ? prev - 1 : 0
                      );
                    }

                    if (e.key === 'Enter' && activeMaterialIndex >= 0) {
                      e.preventDefault();
                      handleChange(
                        'materialName',
                        filteredMaterials[activeMaterialIndex]
                      );
                      setShowMaterialList(false);
                      setActiveMaterialIndex(-1);
                    }

                    if (e.key === 'Escape') {
                      setShowMaterialList(false);
                      setActiveMaterialIndex(-1);
                    }
                  }}
                  className={`mt-1 ${
                    errors.materialName ? 'border-red-500' : ''
                  }`}
                />

                {/* Suggestions */}
                {showMaterialList && filteredMaterials.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-sm max-h-40 overflow-y-auto">
                    {filteredMaterials.slice(0, 8).map((m, index) => (
                      <div
                        key={m}
                        className={`px-3 py-2 text-sm cursor-pointer ${
                          index === activeMaterialIndex
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                        onMouseDown={() => {
                          handleChange('materialName', m);
                          setShowMaterialList(false);
                          setActiveMaterialIndex(-1);
                        }}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                )}

                {errors.materialName && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.materialName}
                  </p>
                )}
              </div>

              {/* Supplier */}
              <div ref={supplierWrapperRef} className="relative">
                <Label>
                  Supplier Name <span className="text-red-500">*</span>
                </Label>

                <Input
                  value={formData.supplierName}
                  placeholder="Type supplier name..."
                  autoComplete="off"
                  onChange={(e) => {
                    handleChange('supplierName', e.target.value);
                    setShowSupplierList(true);
                    setActiveSupplierIndex(-1);
                  }}
                  onFocus={() => {
                    if (formData.supplierName) setShowSupplierList(true);
                  }}
                  onKeyDown={(e) => {
                    if (!showSupplierList || filteredSuppliers.length === 0)
                      return;

                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setActiveSupplierIndex((prev) =>
                        prev < filteredSuppliers.length - 1 ? prev + 1 : prev
                      );
                    }

                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setActiveSupplierIndex((prev) =>
                        prev > 0 ? prev - 1 : 0
                      );
                    }

                    if (e.key === 'Enter' && activeSupplierIndex >= 0) {
                      e.preventDefault();
                      handleChange(
                        'supplierName',
                        filteredSuppliers[activeSupplierIndex]
                      );
                      setShowSupplierList(false);
                      setActiveSupplierIndex(-1);
                    }

                    if (e.key === 'Escape') {
                      setShowSupplierList(false);
                      setActiveSupplierIndex(-1);
                    }
                  }}
                  className={`mt-1 ${
                    errors.supplierName ? 'border-red-500' : ''
                  }`}
                />

                {/* Suggestions */}
                {showSupplierList && filteredSuppliers.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-sm max-h-40 overflow-y-auto">
                    {filteredSuppliers.slice(0, 8).map((m, index) => (
                      <div
                        key={m}
                        className={`px-3 py-2 text-sm cursor-pointer ${
                          index === activeSupplierIndex
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                        onMouseDown={() => {
                          // onMouseDown instead of onClick prevents blur issue
                          handleChange('supplierName', m);
                          setShowSupplierList(false);
                          setActiveSupplierIndex(-1);
                        }}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                )}

                {errors.supplierName && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.supplierName}
                  </p>
                )}
              </div>

              <Separator />

              {/* Batch Number */}
              <div>
                <Label>Batch Number</Label>
                <Input
                  value={formData.batchNumber || ''}
                  placeholder="Enter batch number..."
                  onChange={(e) => handleChange('batchNumber', e.target.value)}
                />
              </div>

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

                <div>
                  <p className="text-gray-600">Batch Number</p>
                  <p className="font-medium text-gray-900">
                    {formData.batchNumber || '—'}
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
    </PageContainer>
  );
}
