-- CreateEnum
CREATE TYPE "BulkSeedStatus" AS ENUM ('CREATED', 'SCANNED', 'WEIGHED');

-- CreateTable
CREATE TABLE "BulkWeighingSeed" (
    "id" SERIAL NOT NULL,
    "qrId" TEXT NOT NULL,
    "batchId" INTEGER NOT NULL,
    "productExecutionId" INTEGER NOT NULL,
    "batchStepId" INTEGER NOT NULL,
    "batchIngredientId" INTEGER NOT NULL,
    "status" "BulkSeedStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkWeighingSeed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BulkWeighingSeed_qrId_key" ON "BulkWeighingSeed"("qrId");

-- CreateIndex
CREATE INDEX "BulkWeighingSeed_batchId_idx" ON "BulkWeighingSeed"("batchId");

-- CreateIndex
CREATE INDEX "BulkWeighingSeed_productExecutionId_idx" ON "BulkWeighingSeed"("productExecutionId");

-- CreateIndex
CREATE INDEX "BulkWeighingSeed_batchStepId_idx" ON "BulkWeighingSeed"("batchStepId");

-- CreateIndex
CREATE INDEX "BulkWeighingSeed_batchIngredientId_idx" ON "BulkWeighingSeed"("batchIngredientId");

-- AddForeignKey
ALTER TABLE "BulkWeighingSeed" ADD CONSTRAINT "BulkWeighingSeed_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkWeighingSeed" ADD CONSTRAINT "BulkWeighingSeed_productExecutionId_fkey" FOREIGN KEY ("productExecutionId") REFERENCES "ProductExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkWeighingSeed" ADD CONSTRAINT "BulkWeighingSeed_batchStepId_fkey" FOREIGN KEY ("batchStepId") REFERENCES "BatchStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkWeighingSeed" ADD CONSTRAINT "BulkWeighingSeed_batchIngredientId_fkey" FOREIGN KEY ("batchIngredientId") REFERENCES "BatchIngredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
