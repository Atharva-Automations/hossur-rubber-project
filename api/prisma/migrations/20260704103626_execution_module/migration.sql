-- CreateEnum
CREATE TYPE "ExecutionMode" AS ENUM ('BULK', 'SEQUENTIAL');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BatchExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "IngredientExecutionStatus" AS ENUM ('PENDING', 'SCANNED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "BatchStep" ALTER COLUMN "pressure" DROP NOT NULL,
ALTER COLUMN "temperature" DROP NOT NULL,
ALTER COLUMN "rpm" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Execution" (
    "id" SERIAL NOT NULL,
    "executionCode" TEXT NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "mode" "ExecutionMode" NOT NULL,
    "totalBatches" INTEGER NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionBatch" (
    "id" SERIAL NOT NULL,
    "executionId" INTEGER NOT NULL,
    "batchNumber" INTEGER NOT NULL,
    "status" "BatchExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExecutionBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionIngredient" (
    "id" SERIAL NOT NULL,
    "executionBatchId" INTEGER NOT NULL,
    "recipeStepId" INTEGER NOT NULL,
    "stepIngredientId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "binNumber" TEXT,
    "qrId" TEXT NOT NULL,
    "batchSequence" INTEGER NOT NULL,
    "plcIngredientIndex" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "tolerance" DOUBLE PRECISION NOT NULL,
    "status" "IngredientExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "scannedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExecutionIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Execution_executionCode_key" ON "Execution"("executionCode");

-- CreateIndex
CREATE INDEX "Execution_recipeId_idx" ON "Execution"("recipeId");

-- CreateIndex
CREATE INDEX "ExecutionBatch_executionId_idx" ON "ExecutionBatch"("executionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionBatch_executionId_batchNumber_key" ON "ExecutionBatch"("executionId", "batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionIngredient_qrId_key" ON "ExecutionIngredient"("qrId");

-- CreateIndex
CREATE INDEX "ExecutionIngredient_executionBatchId_idx" ON "ExecutionIngredient"("executionBatchId");

-- CreateIndex
CREATE INDEX "ExecutionIngredient_ingredientId_idx" ON "ExecutionIngredient"("ingredientId");

-- CreateIndex
CREATE INDEX "ExecutionIngredient_qrId_idx" ON "ExecutionIngredient"("qrId");

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionBatch" ADD CONSTRAINT "ExecutionBatch_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionIngredient" ADD CONSTRAINT "ExecutionIngredient_executionBatchId_fkey" FOREIGN KEY ("executionBatchId") REFERENCES "ExecutionBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionIngredient" ADD CONSTRAINT "ExecutionIngredient_recipeStepId_fkey" FOREIGN KEY ("recipeStepId") REFERENCES "RecipeStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionIngredient" ADD CONSTRAINT "ExecutionIngredient_stepIngredientId_fkey" FOREIGN KEY ("stepIngredientId") REFERENCES "StepIngredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionIngredient" ADD CONSTRAINT "ExecutionIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
