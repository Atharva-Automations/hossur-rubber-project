'use client';

import api from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  useAvailableForOutward,
  InwardEntryForOutward,
} from '@/hooks/useMaterialStock';
import { useCreateOutward } from '@/hooks/useOutwards';

import { Header, PageContainer, Card } from '@/components/global';
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

export default function AddOutwardPage() {
  const router = useRouter();
  const { data: availableInwardEntries = [], isLoading } =
    useAvailableForOutward();
  const { mutateAsync: createOutward, isPending } = useCreateOutward();

  const [formData, setFormData] = useState({
    inwardId: '',
    unit: '',
    issuedTo: '',
    numBags: '',
  });

  const handleChange = (key: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const selectedInwardEntry = (
    availableInwardEntries as InwardEntryForOutward[]
  ).find((entry) => entry.id.toString() === formData.inwardId);

  // 🧩 Fetch available bag details for selected inward entry
  const { data: availableBags = [], isFetching } = useQuery({
    queryKey: ['availableBags', formData.inwardId],
    queryFn: async () => {
      if (!formData.inwardId) return [];
      console.log('Fetching available bags for inward ID:', formData.inwardId);
      const res = await api.get(
        `/inward/available-bags-by-inward/${formData.inwardId}`
      );
      console.log('Available bags response:', res.data);
      return res.data;
    },
    enabled: !!formData.inwardId,
  });

  const totalAvailableBags = (
    availableBags as Array<{
      qrId: string;
      bagNo: number;
      inward: { bagWeight: number; unit: string };
    }>
  ).length;
  const bagWeight = selectedInwardEntry?.bagWeight || 0;
  const unit = selectedInwardEntry?.unit || 'KG';

  // 🧮 Auto compute total quantity = numBags * bagWeight
  const totalQty =
    formData.numBags && bagWeight
      ? Number(formData.numBags) * Number(bagWeight)
      : 0;

  const handleSubmit = async () => {
    console.log('Form data:', formData);
    console.log('Selected inward entry:', selectedInwardEntry);
    console.log('Available bags:', availableBags);
    console.log('Total available bags:', totalAvailableBags);

    if (
      !formData.inwardId ||
      !formData.issuedTo ||
      !formData.numBags ||
      Number(formData.numBags) < 1
    ) {
      toast({
        title: 'Missing Fields',
        description:
          'Please select material entry, enter issued to, and valid number of bags.',
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
      const selectedQrIds = (availableBags as Array<{ qrId: string }>)
        .slice(0, Number(formData.numBags))
        .map((b: { qrId: string }) => b.qrId);

      console.log('Selected QR IDs:', selectedQrIds);

      const payload = {
        inwardId: Number(formData.inwardId),
        issuedTo: formData.issuedTo,
        quantity: totalQty,
        unit,
        selectedQrIds,
        purpose: 'Production',
        remarks: `Issued ${formData.numBags} bag(s) of ${selectedInwardEntry?.materialName} (${selectedInwardEntry?.supplierName} - ${bagWeight}${unit} bags)`,
        status: 'Pending',
      };

      console.log('Payload:', payload);

      await createOutward(payload);

      toast({
        title: 'Success',
        description: 'Outward entry created successfully!',
      });

      router.push('/outward');
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : 'Failed to save entry.';
      console.error('Error creating outward:', error);
      let responseMessage = errMsg;

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        console.error('Error response:', axiosError.response);
        responseMessage = axiosError.response?.data?.message || errMsg;
      }

      toast({
        title: 'Error',
        description: responseMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <PageContainer>
      <Header
        title="Add Outward Entry"
        description="Register material dispatch from production"
        icon="📤"
      />

      <div className="mt-8 max-w-3xl">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">
            Entry Details
          </h3>

          <div className="space-y-6">
            {/* Inward Entry selection */}
            <div>
              <Label className="text-gray-900 font-medium">
                Material Entry
              </Label>
              <Select
                value={formData.inwardId}
                onValueChange={(v) => {
                  handleChange('inwardId', v);
                  handleChange('numBags', '');
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-white mt-1">
                  <SelectValue
                    placeholder={
                      isLoading ? 'Loading...' : 'Select material entry'
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-md max-h-64 overflow-y-auto">
                  {(
                    availableInwardEntries as Array<{
                      id: number;
                      materialName: string;
                      supplierName: string;
                      bagWeight: number;
                      unit: string;
                      _count: { qrCodes: number };
                    }>
                  ).map(
                    (entry: {
                      id: number;
                      materialName: string;
                      supplierName: string;
                      bagWeight: number;
                      unit: string;
                      _count: { qrCodes: number };
                    }) => (
                      <SelectItem key={entry.id} value={entry.id.toString()}>
                        {entry.materialName} - {entry.supplierName} -{' '}
                        {entry.bagWeight}
                        {entry.unit} bags ({entry._count.qrCodes} available)
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Bag info */}
            {formData.inwardId && (
              <div className="space-y-2">
                {isFetching ? (
                  <p className="text-gray-500 text-sm">
                    Loading available bags...
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-700">
                      <strong>{totalAvailableBags}</strong> bag(s) available
                      from <strong>{selectedInwardEntry?.supplierName}</strong>{' '}
                      — each weighing <strong>{bagWeight}</strong> {unit}.
                    </p>

                    <div>
                      <Label>Number of Bags to Issue</Label>
                      <Input
                        type="number"
                        min={1}
                        max={totalAvailableBags}
                        value={formData.numBags}
                        onChange={(e) =>
                          handleChange('numBags', e.target.value)
                        }
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
              <Input
                value={unit}
                readOnly
                className="bg-gray-50 text-gray-700"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => router.push('/outward')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
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
        </Card>
      </div>
    </PageContainer>
  );
}
