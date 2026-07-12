-- CreateEnum
CREATE TYPE "KneaderExecutionStatus" AS ENUM ('READY', 'RUNNING', 'COMPLETED');

-- CreateTable
CREATE TABLE "KneaderExecution" (
    "id" SERIAL NOT NULL,
    "executionBatchId" INTEGER NOT NULL,
    "currentStepSequence" INTEGER NOT NULL DEFAULT 1,
    "recipeWritten" BOOLEAN NOT NULL DEFAULT false,
    "status" "KneaderExecutionStatus" NOT NULL DEFAULT 'READY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KneaderExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KneaderExecution_executionBatchId_key" ON "KneaderExecution"("executionBatchId");

-- AddForeignKey
ALTER TABLE "KneaderExecution" ADD CONSTRAINT "KneaderExecution_executionBatchId_fkey" FOREIGN KEY ("executionBatchId") REFERENCES "ExecutionBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
