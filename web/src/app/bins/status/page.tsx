'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// ✅ Dummy bins data
const bins = Array.from({ length: 25 }).map((_, i) => {
  const minQty = Math.floor(Math.random() * 30) + 10;
  const maxQty = minQty + Math.floor(Math.random() * 50) + 40;
  const currentQty = Math.floor(Math.random() * maxQty);
  const types = ['Filler', 'Accelerator', 'Polymer', 'Additive'];
  const materials = ['Zinc Oxide', 'Carbon Black', 'Stearic Acid', 'Sulphur'];
  return {
    id: i + 1,
    binNumber: `B-${(i + 1).toString().padStart(2, '0')}`,
    ingredient: materials[i % 4],
    ingredientType: types[i % 4],
    minQty,
    maxQty,
    currentQty,
    updatedAt: new Date(Date.now() - Math.random() * 1e9).toLocaleDateString(),
  };
});

const getFillPercent = (current: number, max: number) =>
  Math.min(100, Math.round((current / max) * 100));

const getBinColor = (current: number, min: number, max: number) => {
  if (current <= min) return 'bg-red-500';
  if (current >= max * 0.9) return 'bg-orange-400';
  return 'bg-green-500';
};

export default function BinStatusPage() {
  const [selectedBin, setSelectedBin] = useState<any | null>(null);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Bin Status Overview</h2>
      </div>

      {/* 🧱 Bin Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {bins.map((bin) => {
          const percent = getFillPercent(bin.currentQty, bin.maxQty);
          const color = getBinColor(bin.currentQty, bin.minQty, bin.maxQty);

          return (
            <div
              key={bin.id}
              onClick={() => setSelectedBin(bin)}
              className="cursor-pointer border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800">{bin.binNumber}</h3>
                <span className="text-xs text-gray-500">{bin.ingredient}</span>
              </div>

              <div className="relative h-32 w-full border rounded-lg overflow-hidden bg-gray-100">
                <div
                  className={`${color} absolute bottom-0 left-0 w-full transition-all duration-700`}
                  style={{ height: `${percent}%` }}
                />
              </div>

              <div className="mt-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Min: {bin.minQty}</span>
                  <span>Max: {bin.maxQty}</span>
                </div>
                <div className="mt-1 flex justify-between items-center">
                  <span className="text-gray-700 font-medium">
                    {bin.currentQty} / {bin.maxQty}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      bin.currentQty <= bin.minQty
                        ? 'bg-red-100 text-red-600'
                        : bin.currentQty >= bin.maxQty * 0.9
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {percent}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🪟 Modal for Selected Bin */}
      <Dialog open={!!selectedBin} onOpenChange={() => setSelectedBin(null)}>
        <DialogContent className="max-w-md bg-white">
          {selectedBin && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedBin.binNumber}</DialogTitle>
                <DialogDescription>
                  Ingredient: <strong>{selectedBin.ingredient}</strong> (
                  {selectedBin.ingredientType})
                </DialogDescription>
              </DialogHeader>

              <div className="mt-3 space-y-3">
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Min Quantity:</strong> {selectedBin.minQty}
                  </p>
                  <p>
                    <strong>Max Quantity:</strong> {selectedBin.maxQty}
                  </p>
                  <p>
                    <strong>Current Quantity:</strong> {selectedBin.currentQty}{' '}
                    / {selectedBin.maxQty}
                  </p>
                  <p>
                    <strong>Last Updated:</strong> {selectedBin.updatedAt}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="pt-3">
                  <Progress
                    value={getFillPercent(
                      selectedBin.currentQty,
                      selectedBin.maxQty
                    )}
                    className={`h-3 ${
                      selectedBin.currentQty <= selectedBin.minQty
                        ? 'bg-red-200'
                        : selectedBin.currentQty >= selectedBin.maxQty * 0.9
                        ? 'bg-orange-200'
                        : 'bg-green-200'
                    }`}
                  />
                  <p className="text-right text-xs mt-1 text-gray-500">
                    {getFillPercent(selectedBin.currentQty, selectedBin.maxQty)}
                    % filled
                  </p>
                </div>

                {/* Recent transactions (dummy for now) */}
                <div>
                  <h4 className="font-medium mb-2 text-gray-800">
                    Recent Transactions
                  </h4>
                  <ul className="text-sm text-gray-600 border rounded-lg p-2 max-h-32 overflow-y-auto">
                    {[...Array(5)].map((_, idx) => (
                      <li key={idx} className="border-b py-1 last:border-0">
                        • Issued {Math.floor(Math.random() * 10) + 1} kg to Line{' '}
                        {Math.ceil(Math.random() * 5)} on{' '}
                        {new Date(
                          Date.now() - Math.random() * 1e8
                        ).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedBin(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
