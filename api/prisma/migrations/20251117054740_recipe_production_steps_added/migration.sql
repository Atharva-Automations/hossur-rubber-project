-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('CREATED', 'WEIGHING', 'EXECUTING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "StepExecutionStatus" AS ENUM ('PENDING', 'READY', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "BagStatus" AS ENUM ('CREATED', 'SCANNED', 'CONSUMED');

-- CreateTable
CREATE TABLE "Batch" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchStep" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "stepType" "StepType" NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "timerSeconds" INTEGER NOT NULL,
    "pressure" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "rpm" DOUBLE PRECISION NOT NULL,
    "status" "StepExecutionStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "BatchStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchIngredient" (
    "id" SERIAL NOT NULL,
    "batchStepId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantityPerUnit" DOUBLE PRECISION NOT NULL,
    "totalQuantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "BatchIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeighedBag" (
    "id" SERIAL NOT NULL,
    "qrId" TEXT NOT NULL,
    "batchId" INTEGER NOT NULL,
    "batchStepId" INTEGER NOT NULL,
    "batchIngredientId" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "status" "BagStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeighedBag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionScan" (
    "id" SERIAL NOT NULL,
    "qrId" TEXT NOT NULL,
    "batchId" INTEGER NOT NULL,
    "batchStepId" INTEGER NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutionScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalProduct" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "qrId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinalProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BatchStep_batchId_idx" ON "BatchStep"("batchId");

-- CreateIndex
CREATE INDEX "BatchIngredient_batchStepId_idx" ON "BatchIngredient"("batchStepId");

-- CreateIndex
CREATE INDEX "BatchIngredient_ingredientId_idx" ON "BatchIngredient"("ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "WeighedBag_qrId_key" ON "WeighedBag"("qrId");

-- CreateIndex
CREATE INDEX "WeighedBag_batchId_idx" ON "WeighedBag"("batchId");

-- CreateIndex
CREATE INDEX "WeighedBag_batchStepId_idx" ON "WeighedBag"("batchStepId");

-- CreateIndex
CREATE INDEX "WeighedBag_batchIngredientId_idx" ON "WeighedBag"("batchIngredientId");

-- CreateIndex
CREATE INDEX "ExecutionScan_batchId_idx" ON "ExecutionScan"("batchId");

-- CreateIndex
CREATE INDEX "ExecutionScan_batchStepId_idx" ON "ExecutionScan"("batchStepId");

-- CreateIndex
CREATE UNIQUE INDEX "FinalProduct_qrId_key" ON "FinalProduct"("qrId");

-- CreateIndex
CREATE INDEX "FinalProduct_batchId_idx" ON "FinalProduct"("batchId");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchStep" ADD CONSTRAINT "BatchStep_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchIngredient" ADD CONSTRAINT "BatchIngredient_batchStepId_fkey" FOREIGN KEY ("batchStepId") REFERENCES "BatchStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchIngredient" ADD CONSTRAINT "BatchIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeighedBag" ADD CONSTRAINT "WeighedBag_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeighedBag" ADD CONSTRAINT "WeighedBag_batchStepId_fkey" FOREIGN KEY ("batchStepId") REFERENCES "BatchStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeighedBag" ADD CONSTRAINT "WeighedBag_batchIngredientId_fkey" FOREIGN KEY ("batchIngredientId") REFERENCES "BatchIngredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionScan" ADD CONSTRAINT "ExecutionScan_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionScan" ADD CONSTRAINT "ExecutionScan_batchStepId_fkey" FOREIGN KEY ("batchStepId") REFERENCES "BatchStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalProduct" ADD CONSTRAINT "FinalProduct_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
