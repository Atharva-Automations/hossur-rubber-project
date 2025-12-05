/*
  Warnings:

  - A unique constraint covering the columns `[batchStepId,sequenceInStep]` on the table `BatchIngredient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batchIngredientId` to the `ExecutionScan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productExecutionId` to the `ExecutionScan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sequenceInStep` to the `ExecutionScan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productExecutionId` to the `FinalProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productSequence` to the `FinalProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productExecutionId` to the `WeighedBag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WeighedBag` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductExecutionStatus" AS ENUM ('CREATED', 'WEIGHING_IN_PROGRESS', 'WEIGHING_COMPLETED', 'STEP_IN_PROGRESS', 'STEP_COMPLETED', 'PRODUCT_COMPLETED');

-- DropForeignKey
ALTER TABLE "public"."BatchIngredient" DROP CONSTRAINT "BatchIngredient_batchStepId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BatchStep" DROP CONSTRAINT "BatchStep_batchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExecutionScan" DROP CONSTRAINT "ExecutionScan_batchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExecutionScan" DROP CONSTRAINT "ExecutionScan_batchStepId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FinalProduct" DROP CONSTRAINT "FinalProduct_batchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WeighedBag" DROP CONSTRAINT "WeighedBag_batchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WeighedBag" DROP CONSTRAINT "WeighedBag_batchIngredientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WeighedBag" DROP CONSTRAINT "WeighedBag_batchStepId_fkey";

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "executeKneader" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "executeMixer" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "weighingStrategy" TEXT NOT NULL DEFAULT 'ONE_BY_ONE';

-- AlterTable
ALTER TABLE "BatchIngredient" ADD COLUMN     "sequenceInStep" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "BatchStep" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "recipeStepId" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ExecutionScan" ADD COLUMN     "batchIngredientId" INTEGER NOT NULL,
ADD COLUMN     "productExecutionId" INTEGER NOT NULL,
ADD COLUMN     "sequenceInStep" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "FinalProduct" ADD COLUMN     "binId" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "productExecutionId" INTEGER NOT NULL,
ADD COLUMN     "productSequence" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "InwardQrCode" ADD COLUMN     "consumedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WeighedBag" ADD COLUMN     "addedToBinAt" TIMESTAMP(3),
ADD COLUMN     "inwardQrCodeId" INTEGER,
ADD COLUMN     "productExecutionId" INTEGER NOT NULL,
ADD COLUMN     "scannedForVerification" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ProductExecution" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "productSequence" INTEGER NOT NULL,
    "status" "ProductExecutionStatus" NOT NULL DEFAULT 'CREATED',
    "weighingStartedAt" TIMESTAMP(3),
    "weighingCompletedAt" TIMESTAMP(3),
    "executionStartedAt" TIMESTAMP(3),
    "executionCompletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepExecution" (
    "id" SERIAL NOT NULL,
    "productExecutionId" INTEGER NOT NULL,
    "batchStepId" INTEGER NOT NULL,
    "status" "StepExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "ingredientsAdded" INTEGER NOT NULL DEFAULT 0,
    "ingredientsExpected" INTEGER NOT NULL,

    CONSTRAINT "StepExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductExecution_batchId_idx" ON "ProductExecution"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductExecution_batchId_productSequence_key" ON "ProductExecution"("batchId", "productSequence");

-- CreateIndex
CREATE INDEX "StepExecution_productExecutionId_idx" ON "StepExecution"("productExecutionId");

-- CreateIndex
CREATE INDEX "StepExecution_batchStepId_idx" ON "StepExecution"("batchStepId");

-- CreateIndex
CREATE UNIQUE INDEX "StepExecution_productExecutionId_batchStepId_key" ON "StepExecution"("productExecutionId", "batchStepId");

-- CreateIndex
CREATE UNIQUE INDEX "BatchIngredient_batchStepId_sequenceInStep_key" ON "BatchIngredient"("batchStepId", "sequenceInStep");

-- CreateIndex
CREATE INDEX "BatchStep_recipeStepId_idx" ON "BatchStep"("recipeStepId");

-- CreateIndex
CREATE INDEX "ExecutionScan_productExecutionId_idx" ON "ExecutionScan"("productExecutionId");

-- CreateIndex
CREATE INDEX "FinalProduct_productExecutionId_idx" ON "FinalProduct"("productExecutionId");

-- CreateIndex
CREATE INDEX "RecipeStep_recipeId_idx" ON "RecipeStep"("recipeId");

-- CreateIndex
CREATE INDEX "WeighedBag_productExecutionId_idx" ON "WeighedBag"("productExecutionId");

-- AddForeignKey
ALTER TABLE "BatchStep" ADD CONSTRAINT "BatchStep_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchStep" ADD CONSTRAINT "BatchStep_recipeStepId_fkey" FOREIGN KEY ("recipeStepId") REFERENCES "RecipeStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchIngredient" ADD CONSTRAINT "BatchIngredient_batchStepId_fkey" FOREIGN KEY ("batchStepId") REFERENCES "BatchStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeighedBag" ADD CONSTRAINT "WeighedBag_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeighedBag" ADD CONSTRAINT "WeighedBag_productExecutionId_fkey" FOREIGN KEY ("productExecutionId") REFERENCES "ProductExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeighedBag" ADD CONSTRAINT "WeighedBag_batchStepId_fkey" FOREIGN KEY ("batchStepId") REFERENCES "BatchStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeighedBag" ADD CONSTRAINT "WeighedBag_batchIngredientId_fkey" FOREIGN KEY ("batchIngredientId") REFERENCES "BatchIngredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeighedBag" ADD CONSTRAINT "WeighedBag_inwardQrCodeId_fkey" FOREIGN KEY ("inwardQrCodeId") REFERENCES "InwardQrCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionScan" ADD CONSTRAINT "ExecutionScan_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionScan" ADD CONSTRAINT "ExecutionScan_productExecutionId_fkey" FOREIGN KEY ("productExecutionId") REFERENCES "ProductExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionScan" ADD CONSTRAINT "ExecutionScan_batchStepId_fkey" FOREIGN KEY ("batchStepId") REFERENCES "BatchStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionScan" ADD CONSTRAINT "ExecutionScan_batchIngredientId_fkey" FOREIGN KEY ("batchIngredientId") REFERENCES "BatchIngredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductExecution" ADD CONSTRAINT "ProductExecution_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepExecution" ADD CONSTRAINT "StepExecution_productExecutionId_fkey" FOREIGN KEY ("productExecutionId") REFERENCES "ProductExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepExecution" ADD CONSTRAINT "StepExecution_batchStepId_fkey" FOREIGN KEY ("batchStepId") REFERENCES "BatchStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalProduct" ADD CONSTRAINT "FinalProduct_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalProduct" ADD CONSTRAINT "FinalProduct_productExecutionId_fkey" FOREIGN KEY ("productExecutionId") REFERENCES "ProductExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
