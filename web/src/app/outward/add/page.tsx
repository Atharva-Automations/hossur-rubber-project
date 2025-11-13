'use client';

import api from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useMaterialStock } from '@/hooks/useMaterialStock';
import { useCreateOutward } from '@/hooks/useOutwards';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AddOutwardPage() {
  const router = useRouter();
  const { data: stock = [], isLoading } = useMaterialStock();
  const { mutateAsync: createOutward, isPending } = useCreateOutward();

  const [formData, setFormData] = useState({
    materialName: '',
    unit: '',
    issuedTo: '',
    numBags: '',
  });

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const selectedMaterial = stock.find(
    (m) => m.materialName === formData.materialName
  );

  // 🧩 Fetch available bag details for selected material
  const { data: availableBags = [], isFetching } = useQuery({
    queryKey: ['availableBags', formData.materialName],
    queryFn: async () => {
      if (!formData.materialName) return [];
      const res = await api.get(
        `/inward/available-bags/${formData.materialName}`
      );
      return res.data;
    },
    enabled: !!formData.materialName,
  });

  const totalAvailableBags = availableBags.length;
  const bagWeight = availableBags[0]?.inward?.bagWeight || 0;
  const unit = availableBags[0]?.inward?.unit || selectedMaterial?.unit || 'KG';

  // 🧮 Auto compute total quantity = numBags * bagWeight
  const totalQty =
    formData.numBags && bagWeight
      ? Number(formData.numBags) * Number(bagWeight)
      : 0;

  const handleSubmit = async () => {
    if (
      !formData.materialName ||
      !formData.issuedTo ||
      !formData.numBags ||
      Number(formData.numBags) < 1
    ) {
      toast({
        title: 'Missing Fields',
        description:
          'Please select material, enter issued to, and valid number of bags.',
        variant: 'destructive',
      });
      return;
    }

    if (Number(formData.numBags) > totalAvailableBags) {
      toast({
        title: 'Invalid Quantity',
        description: `You cannot issue more than ${totalAvailableBags} available bags.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const selectedQrIds = availableBags
        .slice(0, Number(formData.numBags))
        .map((b: any) => b.qrId);

      const payload = {
        materialName: formData.materialName,
        issuedTo: formData.issuedTo,
        quantity: totalQty,
        unit,
        selectedQrIds,
        purpose: 'Production',
        remarks: `Issued ${formData.numBags} bag(s) of ${formData.materialName}`,
        status: 'Pending',
      };

      await createOutward(payload);

      toast({
        title: 'Success',
        description: 'Outward entry created successfully!',
      });

      router.push('/outward');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save entry.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white shadow-sm rounded-lg p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Add Outward Entry</h2>

        <div className="space-y-4">
          {/* Material selection */}
          <div>
            <Label>Material</Label>
            <Select
              value={formData.materialName}
              onValueChange={(v) => {
                handleChange('materialName', v);
                handleChange('numBags', '');
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white mt-1">
                <SelectValue
                  placeholder={isLoading ? 'Loading...' : 'Select material'}
                />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md max-h-64 overflow-y-auto">
                {stock.map((m) => (
                  <SelectItem key={m.materialName} value={m.materialName}>
                    {m.materialName} — {m.totalQuantity} {m.unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bag info */}
          {formData.materialName && (
            <div className="space-y-2">
              {isFetching ? (
                <p className="text-gray-500 text-sm">
                  Loading available bags...
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-700">
                    <strong>{totalAvailableBags}</strong> bag(s) available —
                    each weighing <strong>{bagWeight}</strong> {unit}.
                  </p>

                  <div>
                    <Label>Number of Bags to Issue</Label>
                    <Input
                      type="number"
                      min={1}
                      max={totalAvailableBags}
                      value={formData.numBags}
                      onChange={(e) => handleChange('numBags', e.target.value)}
                      placeholder={`1 - ${totalAvailableBags}`}
                    />
                    {formData.numBags && (
                      <p className="text-xs text-gray-500 mt-1">
                        Total Quantity: {totalQty} {unit}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Issued To */}
          <div>
            <Label>Issued To</Label>
            <Input
              value={formData.issuedTo}
              onChange={(e) => handleChange('issuedTo', e.target.value)}
              placeholder="Enter department / line"
            />
          </div>

          {/* Unit */}
          <div>
            <Label>Unit</Label>
            <Input value={unit} readOnly className="bg-gray-50 text-gray-700" />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => router.push('/outward')}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
