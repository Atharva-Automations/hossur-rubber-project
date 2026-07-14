/*
  Warnings:

  - You are about to drop the column `batchId` on the `FinalBatch` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[qrId]` on the table `FinalBatch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[executionBatchId]` on the table `FinalBatch` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `executionBatchId` to the `FinalBatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipeId` to the `FinalBatch` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FinalBatchStatus" AS ENUM ('CREATED', 'CONSUMED');

-- DropForeignKey
ALTER TABLE "public"."FinalBatch" DROP CONSTRAINT "FinalBatch_batchId_fkey";

-- DropIndex
DROP INDEX "public"."FinalBatch_batchId_key";

-- AlterTable
ALTER TABLE "FinalBatch" DROP COLUMN "batchId",
ADD COLUMN     "consumedAt" TIMESTAMP(3),
ADD COLUMN     "executionBatchId" INTEGER NOT NULL,
ADD COLUMN     "recipeId" INTEGER NOT NULL,
ADD COLUMN     "status" "FinalBatchStatus" NOT NULL DEFAULT 'CREATED';

-- CreateIndex
CREATE UNIQUE INDEX "FinalBatch_qrId_key" ON "FinalBatch"("qrId");

-- CreateIndex
CREATE UNIQUE INDEX "FinalBatch_executionBatchId_key" ON "FinalBatch"("executionBatchId");

-- CreateIndex
CREATE INDEX "FinalBatch_recipeId_idx" ON "FinalBatch"("recipeId");

-- AddForeignKey
ALTER TABLE "FinalBatch" ADD CONSTRAINT "FinalBatch_executionBatchId_fkey" FOREIGN KEY ("executionBatchId") REFERENCES "ExecutionBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalBatch" ADD CONSTRAINT "FinalBatch_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
