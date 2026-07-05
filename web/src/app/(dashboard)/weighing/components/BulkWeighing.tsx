'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Section } from '@/components/global';
import { Button } from '@/components/ui/button';
import { ExecutionDialog } from './ExecutionDialog';
import { ExecutionTable } from './ExecutionTable';
import { ExecutionItem } from '../types/execution';
import { useExecution, useCreateExecution } from '../hooks/useExecution';
import ExecutionQrPreviewModal from './ExecutionQrPreviewModal';

export function BulkWeighing() {
  const { recipes, executions } = useExecution();
  const createExecution = useCreateExecution();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [batchCount, setBatchCount] = useState('1');
  const [recipeError, setRecipeError] = useState('');
  const [batchError, setBatchError] = useState('');
  const [selectedExecution, setSelectedExecution] =
    useState<ExecutionItem | null>(null);
  const [qrPreviewOpen, setQrPreviewOpen] = useState(false);

  const resetForm = () => {
    setSelectedRecipeId('');
    setBatchCount('1');
    setRecipeError('');
    setBatchError('');
  };

  const handleSubmit = () => {
    const trimmedRecipeId = selectedRecipeId.trim();
    const parsedBatchCount = Number(batchCount);

    const nextRecipeError = trimmedRecipeId ? '' : 'Recipe is required.';
    const nextBatchError =
      Number.isFinite(parsedBatchCount) && parsedBatchCount > 0
        ? ''
        : 'Number of batches must be greater than 0.';

    setRecipeError(nextRecipeError);
    setBatchError(nextBatchError);

    if (nextRecipeError || nextBatchError) {
      return;
    }

    createExecution.mutate(
      {
        recipeId: Number(trimmedRecipeId),
        totalBatches: parsedBatchCount,
        mode: 'BULK',
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          resetForm();
        },
      }
    );

    setDialogOpen(false);
    resetForm();
  };

  const handlePrintAll = (execution: ExecutionItem) => {
    setSelectedExecution(execution);
    setQrPreviewOpen(true);
  };

  const handlePrintBatch = (execution: ExecutionItem) => {
    console.log('Print batch QR', execution);
  };

  const handleEdit = (execution: ExecutionItem) => {
    console.log('Edit execution', execution);
  };

  const handleDelete = (execution: ExecutionItem) => {
    console.log('Delete execution', execution);
  };

  return (
    <Section
      title="Bulk Weighing"
      description="Create and manage bulk weighing executions"
    >
      <div className="flex justify-end">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setDialogOpen(true)}
        >
          <Plus size={16} />
          Create Execution
        </Button>
      </div>

      <div className="mt-6">
        <ExecutionTable
          executions={executions}
          onPrintAll={handlePrintAll}
          onPrintBatch={handlePrintBatch}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <ExecutionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
        recipes={recipes}
        selectedRecipeId={selectedRecipeId}
        batchCount={Number(batchCount)}
        recipeError={recipeError}
        batchError={batchError}
        onRecipeChange={(value) => {
          setSelectedRecipeId(value);
          if (recipeError) {
            setRecipeError('');
          }
        }}
        onBatchCountChange={(value) => {
          setBatchCount(value);
          if (batchError) {
            setBatchError('');
          }
        }}
        onSubmit={handleSubmit}
      />
      <ExecutionQrPreviewModal
        open={qrPreviewOpen}
        executionId={selectedExecution?.id}
        onClose={() => {
          setQrPreviewOpen(false);
          setSelectedExecution(null);
        }}
      />
    </Section>
  );
}
