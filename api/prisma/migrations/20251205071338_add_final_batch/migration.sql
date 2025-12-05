-- CreateTable
CREATE TABLE "FinalBatch" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "qrId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinalBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinalBatch_batchId_key" ON "FinalBatch"("batchId");

-- AddForeignKey
ALTER TABLE "FinalBatch" ADD CONSTRAINT "FinalBatch_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
