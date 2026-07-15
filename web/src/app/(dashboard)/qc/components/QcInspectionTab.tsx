'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/global';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import {
  qcApi,
  type InspectionPayload,
  type ScanQcResponse,
} from '../services/qc.api';
import { getInspectionOutcome } from './qc-utils';
import QcHistoryTable from './QcHistoryTable';

const parameterFields = [
  { key: 'hardnessActual', label: 'Hardness' },
  { key: 'tensileActual', label: 'Tensile' },
  { key: 'elongationActual', label: 'Elongation' },
  { key: 'specificGravityActual', label: 'Specific Gravity' },
  { key: 'compressionSetActual', label: 'Compression Set' },
] as const;

export default function QcInspectionTab() {
  const [qrId, setQrId] = useState('');
  const [batch, setBatch] = useState<ScanQcResponse | null>(null);
  const [formData, setFormData] = useState<{
    hardnessActual: string;
    tensileActual: string;
    elongationActual: string;
    specificGravityActual: string;
    compressionSetActual: string;
    remarks: string;
  }>({
    hardnessActual: '',
    tensileActual: '',
    elongationActual: '',
    specificGravityActual: '',
    compressionSetActual: '',
    remarks: '',
  });

  const scanMutation = useMutation({
    mutationFn: async (value: string) => (await qcApi.scanQr(value)).data,
    onSuccess: (data) => {
      setBatch(data);
      toast({ title: 'Batch details loaded successfully' });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setBatch(null);
      toast({
        title: 'Unable to load batch',
        description: err.response?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const queryClient = useQueryClient();

  const createInspection = useMutation({
    mutationFn: async (payload: InspectionPayload) =>
      (await qcApi.createInspection(payload)).data,
    onSuccess: (res: { message?: string }) => {
      toast({ title: res.message || 'Inspection saved successfully' });
      queryClient.invalidateQueries({ queryKey: ['qc-inspections'] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Unable to save inspection',
        description: err.response?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const preview = batch
    ? getInspectionOutcome(batch.specification, {
        hardness: formData.hardnessActual
          ? Number(formData.hardnessActual)
          : undefined,
        tensile: formData.tensileActual
          ? Number(formData.tensileActual)
          : undefined,
        elongation: formData.elongationActual
          ? Number(formData.elongationActual)
          : undefined,
        specificGravity: formData.specificGravityActual
          ? Number(formData.specificGravityActual)
          : undefined,
        compressionSet: formData.compressionSetActual
          ? Number(formData.compressionSetActual)
          : undefined,
      })
    : null;

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleScan = () => {
    if (!qrId.trim()) {
      toast({
        title: 'QR ID is required',
        description: 'Enter the final batch QR ID before scanning.',
        variant: 'destructive',
      });
      return;
    }

    scanMutation.mutate(qrId.trim());
  };

  const handleSubmit = () => {
    if (!batch) {
      toast({
        title: 'No batch loaded',
        description:
          'Scan the batch QR ID first to load the recipe and specification.',
        variant: 'destructive',
      });
      return;
    }

    const payload: InspectionPayload = {
      finalBatchId: batch.finalBatchId,
      hardnessActual: formData.hardnessActual
        ? Number(formData.hardnessActual)
        : undefined,
      tensileActual: formData.tensileActual
        ? Number(formData.tensileActual)
        : undefined,
      elongationActual: formData.elongationActual
        ? Number(formData.elongationActual)
        : undefined,
      specificGravityActual: formData.specificGravityActual
        ? Number(formData.specificGravityActual)
        : undefined,
      compressionSetActual: formData.compressionSetActual
        ? Number(formData.compressionSetActual)
        : undefined,
      remarks: formData.remarks || undefined,
    };

    createInspection.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <Label className="text-gray-900">Final batch QR ID</Label>
            <Input
              value={qrId}
              onChange={(event) => setQrId(event.target.value)}
              placeholder="Enter QR ID"
              className="mt-2 bg-white border-gray-200"
            />
          </div>
          <Button onClick={handleScan} disabled={scanMutation.isPending}>
            {scanMutation.isPending ? 'Scanning...' : 'Scan Batch'}
          </Button>
        </div>

        {batch && (
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-900">
                Scanned batch details
              </h3>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">QR ID:</span> {batch.qrId}
                </p>
                <p>
                  <span className="font-medium">Recipe:</span>{' '}
                  {batch.recipe?.recipeCode || 'N/A'} -{' '}
                  {batch.recipe?.name || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Batch:</span>{' '}
                  {batch.batch?.batchNumber || 'N/A'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="font-semibold text-gray-900">
                Target values from specification
              </h3>
              <div className="mt-3 grid gap-2 text-sm text-gray-700">
                {parameterFields.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                  >
                    <span>{field.label}</span>
                    <span className="font-medium">
                      {batch.specification[
                        field.key.replace(
                          'Actual',
                          ''
                        ) as keyof typeof batch.specification
                      ] ?? '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {batch && (
        <Card className="border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Enter actual test values
            </h3>
            <p className="text-sm text-gray-600">
              The values will be compared with the specification and marked as
              PASS or FAIL.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {parameterFields.map((field) => (
              <div key={field.key}>
                <Label className="text-gray-900">{field.label}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData[field.key]}
                  onChange={(event) =>
                    handleChange(field.key, event.target.value)
                  }
                  className="mt-2 bg-white border-gray-200"
                  placeholder="Enter actual value"
                />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Label className="text-gray-900">Remarks</Label>
            <Textarea
              value={formData.remarks}
              onChange={(event) => handleChange('remarks', event.target.value)}
              className="mt-2 bg-white border-gray-200"
              placeholder="Add any notes about the inspection"
            />
          </div>

          {preview && (
            <div
              className={`mt-6 rounded-xl border px-4 py-3 ${
                preview.passed
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <p className="text-sm font-semibold">
                Result:{' '}
                <span
                  className={preview.passed ? 'text-green-700' : 'text-red-700'}
                >
                  {preview.status}
                </span>
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {preview.passed
                  ? 'The actual values match the configured target values.'
                  : 'One or more actual values differ from the configured target values.'}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={createInspection.isPending}
            >
              {createInspection.isPending
                ? 'Saving inspection...'
                : 'Save Inspection'}
            </Button>
          </div>
        </Card>
      )}

      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            QC Inspection History
          </h3>
          <p className="text-sm text-gray-600">
            View past inspections and print QR labels for inspected batches.
          </p>
        </div>
        <QcHistoryTable />
      </div>
    </div>
  );
}
