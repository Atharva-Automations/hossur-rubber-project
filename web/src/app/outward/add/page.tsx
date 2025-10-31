'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export default function AddOutwardPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    materialName: '',
    quantity: '',
    unit: 'KG',
    issuedTo: '',
    purpose: '',
    remarks: '',
  });

  const handleChange = (field: string, value: string) =>
    setForm({ ...form, [field]: value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Outward Entry:', form);
    // Later: call API to save entry
    router.push('/outward');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Add New Outward Entry</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Material */}
          <div>
            <Label>Material</Label>
            <Select
              value={form.materialName}
              onValueChange={(v) => handleChange('materialName', v)}
            >
              <SelectTrigger className="bg-white mt-1">
                <SelectValue placeholder="Select Material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Zinc Oxide">Zinc Oxide</SelectItem>
                <SelectItem value="Carbon Black">Carbon Black</SelectItem>
                <SelectItem value="Stearic Acid">Stearic Acid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              placeholder="Enter Quantity"
              value={form.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
            />
          </div>

          {/* Unit */}
          <div>
            <Label>Unit</Label>
            <Select
              value={form.unit}
              onValueChange={(v) => handleChange('unit', v)}
            >
              <SelectTrigger className="bg-white mt-1">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KG">Kilogram (KG)</SelectItem>
                <SelectItem value="L">Litre (L)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Issued To */}
          <div>
            <Label>Issued To</Label>
            <Input
              placeholder="Production / Line / Department"
              value={form.issuedTo}
              onChange={(e) => handleChange('issuedTo', e.target.value)}
            />
          </div>

          {/* Purpose */}
          <div>
            <Label>Purpose</Label>
            <Input
              placeholder="Purpose of issue"
              value={form.purpose}
              onChange={(e) => handleChange('purpose', e.target.value)}
            />
          </div>

          {/* Remarks */}
          <div className="sm:col-span-2">
            <Label>Remarks</Label>
            <Input
              placeholder="Optional remarks"
              value={form.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/outward')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Entry
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
