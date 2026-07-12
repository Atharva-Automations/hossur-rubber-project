/*
  Warnings:

  - The values [SCANNED,COMPLETED] on the enum `IngredientExecutionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isActive` on the `ExecutionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `scannedAt` on the `ExecutionIngredient` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BatchProcessStatus" AS ENUM ('PENDING', 'READY', 'RUNNING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MasterBatchStatus" AS ENUM ('CREATED', 'IN_STOCK', 'CONSUMED', 'SCRAPPED');

-- AlterEnum
BEGIN;
CREATE TYPE "IngredientExecutionStatus_new" AS ENUM ('PENDING', 'WEIGHED', 'CONSUMED', 'CANCELLED');
ALTER TABLE "public"."ExecutionIngredient" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ExecutionIngredient" ALTER COLUMN "status" TYPE "IngredientExecutionStatus_new" USING ("status"::text::"IngredientExecutionStatus_new");
ALTER TYPE "IngredientExecutionStatus" RENAME TO "IngredientExecutionStatus_old";
ALTER TYPE "IngredientExecutionStatus_new" RENAME TO "IngredientExecutionStatus";
DROP TYPE "public"."IngredientExecutionStatus_old";
ALTER TABLE "ExecutionIngredient" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "ExecutionBatch" DROP COLUMN "isActive",
ADD COLUMN     "kneaderStatus" "BatchProcessStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "mixingStatus" "BatchProcessStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "ExecutionIngredient" DROP COLUMN "scannedAt",
ADD COLUMN     "weighedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MasterBatch" (
    "id" SERIAL NOT NULL,
    "qrId" TEXT NOT NULL,
    "executionBatchId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "status" "MasterBatchStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumedAt" TIMESTAMP(3),

    CONSTRAINT "MasterBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterBatch_qrId_key" ON "MasterBatch"("qrId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterBatch_executionBatchId_key" ON "MasterBatch"("executionBatchId");

-- CreateIndex
CREATE INDEX "MasterBatch_recipeId_idx" ON "MasterBatch"("recipeId");

-- AddForeignKey
ALTER TABLE "MasterBatch" ADD CONSTRAINT "MasterBatch_executionBatchId_fkey" FOREIGN KEY ("executionBatchId") REFERENCES "ExecutionBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterBatch" ADD CONSTRAINT "MasterBatch_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
