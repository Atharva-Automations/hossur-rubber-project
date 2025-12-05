/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import api from '@/lib/api';
import QRCode from 'react-qr-code';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProductQrModal from './components/modals/ProductQrModal';

type NextWeighItem = {
  batchId: number;
  productExecutionId: number;
  productSequence: number;
  batchStepId: number;
  batchIngredientId: number;
  stepType: 'KNEADER' | 'MIXING';
  stepSequenceNumber: number;
  ingredientId: number;
  ingredientCode: string;
  ingredientName: string;
  binNumber: string | null;
  requiredWeight: number;
  unit: string;
  sequenceInStep: number;
  qrId?: string;
} | null;

type ExecutionStatusProduct = {
  productExecutionId: number;
  productSequence: number;
  status: string;
  weighingStartedAt?: string | null;
  weighingCompletedAt?: string | null;
  executionStartedAt?: string | null;
  executionCompletedAt?: string | null;
  steps: {
    stepExecutionId: number;
    batchStepId: number;
    stepType: 'KNEADER' | 'MIXING';
    sequenceNumber: number;
    status: 'PENDING' | 'READY' | 'IN_PROGRESS' | 'DONE';
    ingredientsAdded: number;
    ingredientsExpected: number;
  }[];
};

type ExecutionStatusResponse = {
  batchId: number;
  status: string;
  products: ExecutionStatusProduct[];
};

type StepDetails = {
  productExecutionId: number;
  productSequence: number;
  stepExecutionId: number;
  batchStepId: number;
  stepType: 'KNEADER' | 'MIXING';
  sequenceNumber: number;
  timerSeconds: number;
  remainingSeconds: number | null;
  temperature: number;
  pressure: number;
  rpm: number;
  stepStatus: 'PENDING' | 'READY' | 'IN_PROGRESS' | 'DONE';
  expectedIngredients: {
    batchIngredientId: number;
    stepNumber: number;
    stepType: 'KNEADER' | 'MIXING';
    ingredientCode: string;
    ingredientName: string;
    quantityPerUnit: number;
    unit: string;
    scanned: boolean;
  }[];
  executedIngredients: {
    qrId: string;
    ingredientCode: string;
    ingredientName: string;
  }[];
};

const STEPS = ['QR Mode', 'Weighing', 'Execution', 'Completed'] as const;

export default function ExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const batchId = Number(id);

  // ---------- WEIGHING STATE ----------
  const [weight, setWeight] = useState('');
  const [, setLoading] = useState(false);
  const [bulkList, setBulkList] = useState<any[]>([]);
  const [bulkScanInput, setBulkScanInput] = useState('');
  const [lastQr, setLastQr] = useState<string | null>(null);
  const [weighedList, setWeighedList] = useState<any[]>([]);
  const [stepIndex, setStepIndex] = useState<0 | 1 | 2 | 3>(0);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [bulkScannedItem, setBulkScannedItem] = useState<any>(null);
  const [currentItem, setCurrentItem] = useState<NextWeighItem>(null);
  const [qrMode, setQrMode] = useState<'SEQUENTIAL' | 'BULK' | null>(null);
  const [weighingCompleted, setWeighingCompleted] = useState(false);

  // ---------- EXECUTION STATE ----------
  const [executionStatus, setExecutionStatus] =
    useState<ExecutionStatusResponse | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState<StepDetails | null>(null);
  const [scanInput, setScanInput] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [, setHasNextStep] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState(null);

  // ---------- EFFECTS ----------

  useEffect(() => {
    loadWeighedList();
  }, []);

  useEffect(() => {
    if (stepIndex === 2) {
      loadExecutionStatus();
    }
  }, [stepIndex]);

  // Timer countdown
  useEffect(() => {
    if (!timerRunning || remainingSeconds === null) return;

    const id = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return prev;

        if (prev <= 1) {
          clearInterval(id);
          setTimerRunning(false);

          // COMPLETE STEP
          handleCompleteStep().then(() => {
            // 🔥 FIX #1: Reload executed list immediately
            if (
              currentStep?.productExecutionId !== undefined &&
              currentStep?.productExecutionId !== null
            ) {
              loadActiveStepForProduct(currentStep.productExecutionId);
            }
            loadExecutionStatus();
          });

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [timerRunning, remainingSeconds]);

  // ---------- API HELPERS ----------

  const loadWeighedList = async () => {
    const res = await api.get(`/batch/${batchId}/weighing/list`);
    setWeighedList(res.data || []);
  };

  // ---------- WEIGHING LOGIC ----------

  const handleModeSelect = async (mode: 'SEQUENTIAL' | 'BULK') => {
    setQrMode(mode);

    if (mode === 'BULK') {
      try {
        await api.post(`/batch/${batchId}/bulk/start`);
        const res = await api.get(`/batch/${batchId}/bulk/labels`);
        setBulkList(res.data || []);
        setStepIndex(1);
      } catch (err: any) {
        toast({
          title: 'Failed to start BULK mode',
          description: err?.response?.data?.message || 'Failed.',
          variant: 'destructive',
        });
        setQrMode(null);
      }
      return;
    }

    try {
      await api.post(`/batch/${batchId}/start`);
      await loadNext();
      setStepIndex(1);
    } catch (err: any) {
      toast({
        title: 'Failed to start execution',
        description: err?.response?.data?.message || 'Failed.',
        variant: 'destructive',
      });
      setQrMode(null);
    }
  };

  const loadNext = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/batch/${batchId}/weighing/next`);
      const item: NextWeighItem = res.data || null;
      setCurrentItem(item);

      if (!item) {
        setWeighingCompleted(true);
        await loadWeighedList();
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmWeigh = async () => {
    const numericWeight = Number(weight);
    if (!numericWeight || numericWeight <= 0) {
      toast({
        title: 'Invalid weight',
        description: 'Enter a positive weight.',
        variant: 'destructive',
      });
      return;
    }

    // SEQUENTIAL
    if (qrMode === 'SEQUENTIAL' && currentItem) {
      try {
        const res = await api.post(`/batch/${batchId}/weigh`, {
          batchId,
          batchStepId: currentItem.batchStepId,
          batchIngredientId: currentItem.batchIngredientId,
          weight: numericWeight,
        });

        setCurrentItem({ ...currentItem, qrId: res.data.qrId });
        setLastQr(res.data.qrId);

        toast({ title: 'Correct Weight!', description: res.data.qrId });

        setShowWeightModal(false);
        setWeight('');
      } catch (err: any) {
        toast({
          title: 'Weigh failed',
          description: err?.response?.data?.message || 'Failed.',
          variant: 'destructive',
        });
      }
      return;
    }

    // BULK
    if (qrMode === 'BULK' && bulkScannedItem) {
      try {
        const res = await api.post(`/batch/${batchId}/bulk/weigh`, {
          qrId: bulkScannedItem.qrId,
          weight: numericWeight,
        });

        toast({
          title: 'Bulk Weight Saved!',
          description: res.data.qrId,
        });

        const refreshed = await api.get(`/batch/${batchId}/bulk/labels`);
        setBulkList(refreshed.data || []);

        setBulkScannedItem(null);
        setBulkScanInput('');

        setShowWeightModal(false);
        setWeight('');
      } catch (err: any) {
        toast({
          title: 'Weigh failed',
          description: err?.response?.data?.message || 'Failed.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleNextIngredient = async () => {
    if (!currentItem?.qrId) {
      toast({ title: 'Scan not completed', variant: 'destructive' });
      return;
    }

    await loadNext();
    await loadWeighedList();
  };

  const isProductCompleted = (
    productSeq: number,
    items: any[],
    weighed: any[]
  ) => {
    return items.every((item) =>
      weighed.some(
        (w) =>
          w.batchIngredientId === item.batchIngredientId &&
          w.productSequence === productSeq
      )
    );
  };

  // ---------- EXECUTION LOGIC ----------

  const loadExecutionStatus = async () => {
    try {
      const res = await api.get(`/batch/${batchId}/execution/status`);
      const data: ExecutionStatusResponse = res.data;
      setExecutionStatus(data);

      // 🔍 Derive stepCompleted & hasNextStep from backend state
      if (selectedProductId && currentStep) {
        const product = data.products.find(
          (p) => p.productExecutionId === selectedProductId
        );

        if (product) {
          const thisStep = product.steps.find(
            (s) => s.batchStepId === currentStep.batchStepId
          );
          const nextStep = product.steps.find(
            (s) => s.sequenceNumber > currentStep.sequenceNumber
          );

          // Step is considered completed when backend status is DONE
          setStepCompleted(thisStep?.status === 'DONE');

          // We have a next step if anything exists with higher sequence
          setHasNextStep(!!nextStep);
        }
      }
    } catch (err: any) {
      toast({
        title: 'Failed to load execution status',
        description: err?.response?.data?.message || 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const loadActiveStepForProduct = async (productExecutionId: number) => {
    try {
      const res = await api.get(`/batch/${batchId}/execution/active-step`, {
        params: { productExecutionId },
      });

      const step: StepDetails = res.data;
      setCurrentStep(step);

      // Reset flags
      setStepCompleted(step.stepStatus === 'DONE');

      // If step already completed, do NOTHING — backend will supply next
      if (step.stepStatus === 'DONE') {
        setTimerRunning(false);
        return;
      }

      // If step is IN_PROGRESS → resume timer
      if (step.stepStatus === 'IN_PROGRESS') {
        const secs = step.remainingSeconds ?? step.timerSeconds;

        if (secs > 0) {
          setRemainingSeconds(secs);
          setTimerRunning(true);
        } else {
          // backend says timer = 0 → complete it
          await handleCompleteStep();
        }
        return;
      }

      // READY state (waiting for scan or start)
      setRemainingSeconds(step.timerSeconds);
      setTimerRunning(false);
    } catch (err: any) {
      toast({
        title: 'Failed to load step',
        description: err?.response?.data?.message || 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleStartExecutionPhase = async () => {
    try {
      await api.post(`/batch/${batchId}/start-execution`);
      toast({ title: 'Execution Phase Started' });
      setStepIndex(2);
    } catch (err: any) {
      toast({
        title: 'Failed to start execution',
        description: err?.response?.data?.message || 'Error',
        variant: 'destructive',
      });
    }
  };

  const handleOpenProductExecution = async (
    product: ExecutionStatusProduct
  ) => {
    setSelectedProductId(product.productExecutionId);
    await loadActiveStepForProduct(product.productExecutionId);
  };

  const handleStartProductExecution = async (
    product: ExecutionStatusProduct
  ) => {
    if (!executionStatus) return;

    const hasActive = executionStatus.products.some(
      (p) => p.status === 'STEP_IN_PROGRESS'
    );
    if (hasActive) {
      toast({
        title: 'Another product is already in execution',
        description: 'Finish the current product before starting another one.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Backend will decide which is first step if batchStepId is omitted/null
      await api.post(
        `/batch/${batchId}/product-execution/${product.productExecutionId}/start`,
        {
          productExecutionId: product.productExecutionId,
          batchStepId: null,
          source: 'UI_PRODUCT_START',
        }
      );

      await loadExecutionStatus();
      await handleOpenProductExecution(product);
    } catch (err: any) {
      toast({
        title: 'Cannot start product execution',
        description: err?.response?.data?.message || 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleScanExecutionQr = async () => {
    if (!currentStep || !scanInput.trim()) return;

    if (timerRunning) {
      toast({
        title: 'Step running',
        description: 'You cannot scan ingredients while machine is running.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.post(`/batch/${batchId}/execution/scan`, {
        qrId: scanInput.trim(),
      });

      setScanInput('');
      await loadActiveStepForProduct(currentStep.productExecutionId);
      await loadExecutionStatus();
    } catch (err: any) {
      toast({
        title: 'Scan failed',
        description: err?.response?.data?.message || 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleStartStep = async () => {
    if (!currentStep) return;

    const allScanned = currentStep.expectedIngredients.every((i) => i.scanned);
    if (!allScanned) {
      toast({
        title: 'Ingredients pending',
        description: 'Scan all ingredients before starting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.post(
        `/batch/${batchId}/product-execution/${currentStep.productExecutionId}/steps/${currentStep.batchStepId}/start`
      );

      setStepCompleted(false);

      // Now the step is IN_PROGRESS — start timer
      setRemainingSeconds(currentStep.timerSeconds);
      setTimerRunning(true);

      setCurrentStep((prev) =>
        prev ? { ...prev, stepStatus: 'IN_PROGRESS' } : prev
      );

      // Reload status
      await loadExecutionStatus();
    } catch (err: any) {
      toast({
        title: 'Cannot start step',
        description: err?.response?.data?.message || 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteStep = async () => {
    if (!currentStep || stepCompleted) return;

    try {
      await api.post(`/batch/${batchId}/execution/complete-step`, {
        productExecutionId: currentStep.productExecutionId,
        batchStepId: currentStep.batchStepId,
        source: 'AUTO_TIMER',
      });

      setTimerRunning(false);
      setStepCompleted(true);

      // Wait small delay so DB commits (important!)
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Reload status + active step
      await loadExecutionStatus();
      await loadActiveStepForProduct(currentStep.productExecutionId);
    } catch (err: any) {
      toast({
        title: 'Cannot complete step',
        description: err?.response?.data?.message || 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleBackToProducts = () => {
    setSelectedProductId(null);
    setCurrentStep(null);
    setTimerRunning(false);
    setRemainingSeconds(null);
    setStepCompleted(false);
  };

  const handleGenerateProductQr = async () => {
    try {
      const res = await api.post(
        `/batch/${batchId}/product-execution/${selectedProductId}/finalize`
      );
      setQrData(res.data);
      setQrModalOpen(true);
      await loadExecutionStatus();
    } catch (err: any) {
      if (err?.response?.data?.message) {
        toast({
          title: 'Failed',
          description: err.response.data.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Failed',
          description: 'Unknown error',
          variant: 'destructive',
        });
      }
    }
  };

  // ---------- DERIVED EXECUTION STATE ----------

  const hasActiveProduct =
    executionStatus?.products.some((p) => p.status === 'STEP_IN_PROGRESS') ??
    false;

  const pendingProducts =
    executionStatus?.products.filter((p) => p.status !== 'PRODUCT_COMPLETED') ??
    [];

  const completedProducts =
    executionStatus?.products.filter((p) => p.status === 'PRODUCT_COMPLETED') ??
    [];

  // ---------- RENDER ----------

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <h2 className="text-2xl font-semibold">Batch Execution: {id}</h2>

        {/* Progress Steps */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm">
            {STEPS.map((label, idx) => (
              <ProgressStep
                key={label}
                active={stepIndex === idx}
                done={stepIndex > idx}
                label={label}
              >
                {idx < STEPS.length - 1 && <Dash />}
              </ProgressStep>
            ))}
          </div>
        </Card>

        {/* STEP 0 — Select QR mode */}
        {qrMode === null && stepIndex === 0 && (
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Select QR printing mode</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <ModeOption
                title="Sequential"
                description="Print 1 QR after each ingredient weigh"
                onClick={() => handleModeSelect('SEQUENTIAL')}
              />
              <ModeOption
                title="Bulk"
                description="Print all QRs upfront & weigh in any order"
                onClick={() => handleModeSelect('BULK')}
              />
            </div>
          </Card>
        )}

        {/* STEP 1 — Weighing Screen */}
        {/* 1A: Sequential */}
        {stepIndex === 1 && qrMode === 'SEQUENTIAL' && currentItem && (
          <Card className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="text-sm space-y-1 flex-1">
                <div>
                  <b>Product:</b> {currentItem.productSequence}
                </div>
                <div>
                  <b>Step:</b> {currentItem.stepType} (Seq{' '}
                  {currentItem.stepSequenceNumber})
                </div>
                <div>
                  <b>Ingredient:</b> {currentItem.ingredientCode} —{' '}
                  {currentItem.ingredientName}
                </div>
                <div>
                  <b>Bin:</b> {currentItem.binNumber ?? 'Not assigned'}
                </div>
                <div>
                  <b>Required weight:</b> {currentItem.requiredWeight}{' '}
                  {currentItem.unit}
                </div>
              </div>

              <div className="flex justify-center items-center flex-1">
                {lastQr ? (
                  <div className="flex flex-col items-center">
                    <QRCode value={lastQr} size={80} />
                    <p className="mt-2 text-xs font-mono text-gray-600">
                      {lastQr}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    QR will appear here after weighing
                  </p>
                )}
              </div>
            </div>

            {currentItem.qrId && (
              <div className="mt-6 flex items-center justify-between rounded border p-4 bg-green-50">
                <div className="text-green-700 font-semibold">
                  ✔ Weight Correct — QR Generated
                </div>
                <div className="text-sm font-mono">{currentItem.qrId}</div>
              </div>
            )}

            {!currentItem.qrId ? (
              <div className="mt-4">
                <Button
                  onClick={() => setShowWeightModal(true)}
                  className="bg-blue-600 text-white"
                >
                  Weigh Ingredient
                </Button>
              </div>
            ) : (
              <div className="mt-4">
                <Button
                  className="w-full bg-blue-600"
                  onClick={handleNextIngredient}
                >
                  Next Ingredient →
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* 1B: Bulk */}
        {stepIndex === 1 && qrMode === 'BULK' && (
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Scan Ingredient QR</h3>
              <p className="text-sm text-gray-500 mb-3">
                Enter or scan the QR printed for this ingredient.
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="Scan QR here"
                  value={bulkScanInput}
                  onChange={(e) => setBulkScanInput(e.target.value)}
                />

                <Button
                  onClick={async () => {
                    try {
                      const res = await api.post(
                        `/batch/${batchId}/bulk/scan`,
                        {
                          qrId: bulkScanInput.trim(),
                        }
                      );
                      setBulkScannedItem(res.data);
                      setLastQr(res.data.qrId);
                      toast({
                        title: 'QR recognized!',
                        description: res.data.ingredientCode,
                      });
                    } catch (err: any) {
                      toast({
                        title: 'Invalid QR',
                        description:
                          err?.response?.data?.message || 'Scan failed',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  Scan
                </Button>
              </div>
            </div>

            {bulkScannedItem && (
              <div className="rounded border p-4 bg-gray-50 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="text-sm space-y-1 flex-1">
                    <div>
                      <b>Product:</b> {bulkScannedItem.productSequence}
                    </div>
                    <div>
                      <b>Step:</b> {bulkScannedItem.stepType} (Seq{' '}
                      {bulkScannedItem.stepSequenceNumber})
                    </div>
                    <div>
                      <b>Ingredient:</b> {bulkScannedItem.ingredientCode} —{' '}
                      {bulkScannedItem.ingredientName}
                    </div>
                    <div>
                      <b>Bin:</b> {bulkScannedItem.binNumber ?? 'Not assigned'}
                    </div>
                    <div>
                      <b>Required Weight:</b> {bulkScannedItem.requiredWeight}{' '}
                      {bulkScannedItem.unit}
                    </div>
                  </div>

                  <div className="flex flex-col items-center flex-1">
                    <QRCode value={bulkScannedItem.qrId} size={90} />
                    <p className="mt-2 text-xs font-mono">
                      {bulkScannedItem.qrId}
                    </p>
                  </div>
                </div>

                <Button
                  className="bg-blue-600 mt-3"
                  onClick={() => setShowWeightModal(true)}
                >
                  Enter Weight
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* STEP 1.5 — Start Execution Phase */}
        {stepIndex === 1 && qrMode && weighingCompleted && (
          <Card className="p-6 text-center space-y-4">
            <h2 className="text-xl font-semibold text-green-700">
              All Ingredients Weighed!
            </h2>

            <p className="text-gray-600">
              You can now start executing the batch.
            </p>

            <Button
              className="bg-blue-600 text-white"
              onClick={handleStartExecutionPhase}
            >
              Start Execution →
            </Button>
          </Card>
        )}

        {/* STEP 2 — EXECUTION UI */}
        {stepIndex === 2 && (
          <Card className="p-6 space-y-6">
            {selectedProductId == null ? (
              <div className="space-y-6">
                {/* PENDING / ACTIVE PRODUCTS */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Products in this Batch
                  </h3>
                  {pendingProducts.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No products ready for execution yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {pendingProducts.map((p) => (
                        <div
                          key={p.productExecutionId}
                          className="flex items-center justify-between border rounded p-3 text-sm"
                        >
                          <div>
                            <div className="font-semibold">
                              Product {p.productSequence}
                            </div>
                            <div className="text-xs text-gray-500">
                              Status: {p.status.replace(/_/g, ' ')}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenProductExecution(p)}
                            >
                              Open
                            </Button>

                            {p.status === 'WEIGHING_COMPLETED' && (
                              <Button
                                size="sm"
                                disabled={hasActiveProduct}
                                onClick={() => handleStartProductExecution(p)}
                              >
                                Start Execution
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={p.status !== 'STEP_COMPLETED'}
                              onClick={async () => {
                                const qr = await api.get(
                                  `/batch/${batchId}/product/${p.productExecutionId}/qr`
                                );
                                setQrData(qr.data);
                                setQrModalOpen(true);
                              }}
                            >
                              QR
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* COMPLETED PRODUCTS */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Completed Products
                  </h3>
                  {completedProducts.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No products completed yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {completedProducts.map((p) => (
                        <div
                          key={p.productExecutionId}
                          className="flex items-center justify-between border rounded p-3 text-sm bg-green-50"
                        >
                          <div>
                            <div className="font-semibold">
                              Product {p.productSequence}
                            </div>
                            <div className="text-xs text-gray-500">
                              Status: {p.status.replace(/_/g, ' ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : currentStep ? (
              <>
                {/* HEADER */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1 text-sm">
                    <div>
                      <b>Product:</b> {currentStep.productSequence}
                    </div>
                    <div>
                      <b>Machine:</b> {currentStep.stepType}
                    </div>
                    <div>
                      <b>Step No:</b> {currentStep.sequenceNumber}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1 text-right">
                    <div>
                      Timer:{' '}
                      {remainingSeconds != null
                        ? `${remainingSeconds}s`
                        : `${currentStep.timerSeconds}s`}
                    </div>
                    <div>Temp: {currentStep.temperature}°C</div>
                    <div>Pressure: {currentStep.pressure} bar</div>
                    <div>RPM: {currentStep.rpm}</div>
                    <div>Status: {currentStep.stepStatus}</div>
                  </div>
                </div>

                {/* SCAN BOX */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Scan Ingredient QR
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Scan QR here"
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      disabled={timerRunning}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void handleScanExecutionQr();
                        }
                      }}
                    />
                    <Button
                      onClick={handleScanExecutionQr}
                      disabled={timerRunning}
                    >
                      Scan
                    </Button>
                  </div>
                  {timerRunning && (
                    <p className="mt-1 text-xs text-orange-600">
                      Machine running — QR scanning disabled until step
                      completes.
                    </p>
                  )}
                </div>

                {/* EXPECTED INGREDIENTS (GROUPED BY STEP) */}
                <div>
                  <h4 className="font-semibold mb-2">
                    Expected Ingredients (all steps)
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(
                      currentStep.expectedIngredients.reduce((acc, ing) => {
                        if (!acc[ing.stepNumber]) acc[ing.stepNumber] = [];
                        acc[ing.stepNumber].push(ing);
                        return acc;
                      }, {} as Record<number, StepDetails['expectedIngredients']>)
                    ).map(([stepNo, list]) => (
                      <div
                        key={stepNo}
                        className={`border rounded p-3 ${
                          Number(stepNo) === currentStep.sequenceNumber
                            ? 'border-blue-500 bg-blue-50/40'
                            : 'bg-white'
                        }`}
                      >
                        <div className="text-sm font-medium mb-2">
                          Step {stepNo}
                        </div>
                        <div className="space-y-1">
                          {list.map((ing, idx) => (
                            <div
                              key={`${stepNo}-${ing.batchIngredientId ?? idx}`}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                {ing.scanned ? (
                                  <span className="text-green-600 text-lg">
                                    ✔
                                  </span>
                                ) : (
                                  <span className="inline-block w-4 h-4 border rounded-full" />
                                )}
                                <div>
                                  <b>{ing.ingredientCode}</b> —{' '}
                                  {ing.ingredientName}
                                  <div className="text-xs text-gray-500">
                                    Required: {ing.quantityPerUnit} {ing.unit}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {currentStep?.stepStatus === 'DONE' &&
                  executionStatus?.products?.find(
                    (p) => p.productExecutionId === selectedProductId
                  )?.status === 'STEP_COMPLETED' && (
                    <Button
                      className="bg-green-600 text-white"
                      onClick={handleGenerateProductQr}
                    >
                      Generate Product QR →
                    </Button>
                  )}

                {/* ACTION BUTTONS */}
                <div className="flex flex-col md:flex-row gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="md:w-40"
                    onClick={handleBackToProducts}
                  >
                    ← Products
                  </Button>

                  <div className="flex-1 flex flex-col md:flex-row gap-3">
                    {/* Start Step */}
                    <Button
                      className="flex-1 bg-blue-600"
                      onClick={handleStartStep}
                      disabled={
                        !currentStep ||
                        currentStep.stepStatus !== 'READY' ||
                        !currentStep.expectedIngredients.every(
                          (i) => i.scanned
                        ) ||
                        timerRunning
                      }
                    >
                      Start Step
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">Loading step details…</p>
            )}
          </Card>
        )}

        {/* QR HISTORY — SEQUENTIAL */}
        {stepIndex === 1 &&
          qrMode === 'SEQUENTIAL' &&
          weighedList.length > 0 && (
            <Card className="p-4 mt-6">
              <h3 className="text-md font-semibold mb-4">
                Weighed Ingredients
              </h3>

              <Accordion type="multiple" className="w-full">
                {Object.entries(
                  weighedList.reduce((groups, item) => {
                    const key = item.productSequence;
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(item);
                    return groups;
                  }, {} as Record<number, typeof weighedList>)
                ).map(([productSeq, items]) => (
                  <AccordionItem
                    key={productSeq}
                    value={`product-${productSeq}`}
                  >
                    <AccordionTrigger className="text-sm font-medium">
                      Product {productSeq}
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="space-y-3 mt-2">
                        {(items as typeof weighedList).map((w) => (
                          <div
                            key={w.id}
                            className="flex justify-between items-center border rounded p-3 text-sm bg-white shadow-sm"
                          >
                            <div>
                              <b>{w.ingredientCode}</b> — {w.ingredientName}
                              <div className="text-xs text-gray-500">
                                {w.stepType} (Seq: {w.productSequence})
                              </div>
                            </div>

                            <div className="font-mono text-blue-600 text-xs">
                              {w.qrId}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          )}

        {/* BULK QR LABEL LIST */}
        {stepIndex === 1 && qrMode === 'BULK' && bulkList.length > 0 && (
          <Card className="p-4 mt-6">
            <h3 className="text-md font-semibold mb-4">Bulk QR Labels</h3>

            <Accordion type="multiple" className="w-full">
              {Object.entries(
                bulkList.reduce((groups, item) => {
                  const key = item.productSequence;
                  if (!groups[key]) groups[key] = [];
                  groups[key].push(item);
                  return groups;
                }, {} as Record<number, Array<(typeof bulkList)[number]>>)
              ).map(([productSeq, items]) => (
                <AccordionItem key={productSeq} value={`bulk-${productSeq}`}>
                  <AccordionTrigger className="text-sm font-medium flex items-center gap-2">
                    {isProductCompleted(
                      Number(productSeq),
                      items as Array<any>,
                      weighedList as Array<any>
                    ) && <span className="text-green-600 text-lg">✔</span>}
                    Product {productSeq}
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-3 mt-2">
                      {(items as Array<any>).map((w) => (
                        <div
                          key={w.qrId}
                          className="flex justify-between items-center border rounded p-3 text-sm bg-white shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            {w.isWeighed ? (
                              <span className="text-green-600 text-lg">✔</span>
                            ) : (
                              <span className="inline-block w-4 h-4" />
                            )}
                            <div>
                              <b>{w.ingredientCode}</b> — {w.ingredientName}
                              <div className="text-xs text-gray-500">
                                {w.stepType} (Seq {w.stepSequenceNumber})
                              </div>
                            </div>
                          </div>

                          <span className="font-mono text-blue-600 text-xs">
                            {w.qrId}
                          </span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        )}

        {/* Weight Input Modal */}
        <Dialog open={showWeightModal} onOpenChange={setShowWeightModal}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Enter weighed value</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowWeightModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmWeigh}>Check Weight</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ProductQrModal
          open={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          qrData={qrData ?? undefined}
        />
      </div>
    </DashboardLayout>
  );
}

function ProgressStep({
  active,
  done,
  label,
  children,
}: Readonly<{
  active: boolean;
  done: boolean;
  label: string;
  children?: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 items-center gap-2">
      <span
        className={[
          'h-3 w-3 rounded-full',
          done ? 'bg-green-500' : active ? 'bg-blue-600' : 'bg-gray-300',
        ].join(' ')}
      />
      <span className={active ? 'text-blue-700 font-medium' : 'text-gray-600'}>
        {label}
      </span>
      {children}
    </div>
  );
}

function Dash() {
  return <div className="h-px flex-1 bg-gray-200" />;
}

function ModeOption({
  title,
  description,
  onClick,
  disabled,
}: Readonly<{
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded border p-4 text-left transition ${
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'hover:border-blue-500 hover:shadow-md'
      }`}
    >
      <div className="font-semibold">{title}</div>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </button>
  );
}
