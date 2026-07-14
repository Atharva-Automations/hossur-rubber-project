-- CreateEnum
CREATE TYPE "MixingExecutionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "MixingExecution" (
    "id" SERIAL NOT NULL,
    "executionBatchId" INTEGER NOT NULL,
    "currentStageSequence" INTEGER NOT NULL DEFAULT 1,
    "recipeWritten" BOOLEAN NOT NULL DEFAULT false,
    "status" "MixingExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MixingExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MixingExecution_executionBatchId_key" ON "MixingExecution"("executionBatchId");

-- AddForeignKey
ALTER TABLE "MixingExecution" ADD CONSTRAINT "MixingExecution_executionBatchId_fkey" FOREIGN KEY ("executionBatchId") REFERENCES "ExecutionBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
