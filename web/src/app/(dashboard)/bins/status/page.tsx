'use client';

import React, { useState } from 'react';
import { Header, PageContainer, Card } from '@/components/global';
import type { Bin } from '@/types/bins';
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
import { useBinStatus } from '@/hooks/useBinStatus'; // 🔹 new hook for /bins/status

// Helper functions
const getFillPercent = (current: number, max: number) =>
  Math.min(100, Math.round((current / (max || 1)) * 100));

const getBinColor = (current: number, min: number, max: number) => {
  if (current <= min) return 'bg-red-500';
  if (current >= max * 0.9) return 'bg-orange-400';
  return 'bg-green-500';
};

export default function BinStatusPage() {
  const { data: bins = [], isLoading } = useBinStatus();
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);

  if (isLoading) {
    return (
      <PageContainer>
        <Header
          title="Bin Status"
          description="Monitor the current status and inventory levels of all bins"
          icon="📊"
        />
        <div className="mt-8">
          <Card className="p-6 text-center text-gray-500">
            Loading bin data...
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header
        title="Bin Status Overview"
        description="View real-time bin levels and inventory status"
        icon="📊"
      />

      <div className="mt-8">
        {/* 🧱 Bin Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {bins.map((bin: Bin) => {
            const minQty = bin.minQuantity || 0;
            const maxQty = bin.maxQuantity || 1;
            const currentQty = bin.currentQuantity || 0;
            const percent = getFillPercent(currentQty, maxQty);
            const color = getBinColor(currentQty, minQty, maxQty);

            return (
              <div
                key={bin.binNumber}
                onClick={() => setSelectedBin(bin)}
                className={`cursor-pointer border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 ${
                  bin.status === 'EMPTY' ? 'opacity-70' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {bin.binNumber}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {bin.ingredient?.name ||
                      bin.ingredient?.ingredientCode ||
                      '—'}
                  </span>
                </div>

                {/* Bin visual fill */}
                <div className="relative h-32 w-full border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                  <div
                    className={`${color} absolute bottom-0 left-0 w-full transition-all duration-700`}
                    style={{ height: `${percent}%` }}
                  />
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  {bin.status === 'EMPTY' ? (
                    <p className="text-gray-400 italic text-center mt-4">
                      Unassigned Bin
                    </p>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Min: {minQty}</span>
                        <span>Max: {maxQty}</span>
                      </div>
                      <div className="mt-1 flex justify-between items-center">
                        <span className="text-gray-700 font-medium">
                          {currentQty} / {maxQty}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            currentQty <= minQty
                              ? 'bg-red-100 text-red-600'
                              : currentQty >= maxQty * 0.9
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {percent}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🪟 Modal for Selected Bin */}
      <Dialog open={!!selectedBin} onOpenChange={() => setSelectedBin(null)}>
        <DialogContent className="max-w-md bg-white border border-gray-200">
          {selectedBin && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedBin.binNumber}</DialogTitle>
                <DialogDescription>
                  Ingredient:{' '}
                  <strong>
                    {selectedBin.ingredient?.name ||
                      selectedBin.ingredient?.ingredientCode ||
                      '—'}
                  </strong>{' '}
                  {selectedBin.ingredient?.type && (
                    <>({selectedBin.ingredient?.type})</>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-3 space-y-3">
                {selectedBin.status === 'EMPTY' ? (
                  <p className="text-center text-gray-500 italic">
                    This bin is currently unassigned.
                  </p>
                ) : (
                  <>
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Min Quantity:</strong>{' '}
                        {selectedBin.minQuantity || 0}
                      </p>
                      <p>
                        <strong>Max Quantity:</strong>{' '}
                        {selectedBin.maxQuantity || 0}
                      </p>
                      <p>
                        <strong>Current Quantity:</strong>{' '}
                        {selectedBin.currentQuantity || 0} /{' '}
                        {selectedBin.maxQuantity || 0}
                      </p>
                      <p>
                        <strong>Status:</strong> {selectedBin.status}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="pt-3">
                      <Progress
                        value={getFillPercent(
                          selectedBin.currentQuantity ?? 0,
                          selectedBin.maxQuantity ?? 1
                        )}
                        className={`h-3 ${
                          (selectedBin.currentQuantity ?? 0) <=
                          (selectedBin.minQuantity ?? 0)
                            ? 'bg-red-200'
                            : (selectedBin.currentQuantity ?? 0) >=
                              (selectedBin.maxQuantity ?? 1) * 0.9
                            ? 'bg-orange-200'
                            : 'bg-green-200'
                        }`}
                      />
                      <p className="text-right text-xs mt-1 text-gray-500">
                        {getFillPercent(
                          selectedBin.currentQuantity ?? 0,
                          selectedBin.maxQuantity ?? 1
                        )}
                        % filled
                      </p>
                    </div>

                    {/* Placeholder for logs (for later PLC/scan integration) */}
                    <div>
                      <h4 className="font-medium mb-2 text-gray-900">
                        Recent Transactions
                      </h4>
                      <ul className="text-sm text-gray-600 border border-gray-200 rounded-lg p-2 max-h-32 overflow-y-auto">
                        <li className="italic text-gray-400 text-center">
                          Transaction logs coming soon...
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setSelectedBin(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
