-- CreateEnum
CREATE TYPE "QcStatus" AS ENUM ('PASS', 'FAIL');

-- CreateTable
CREATE TABLE "QcSpecification" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "hardness" DOUBLE PRECISION,
    "tensile" DOUBLE PRECISION,
    "elongation" DOUBLE PRECISION,
    "specificGravity" DOUBLE PRECISION,
    "compressionSet" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QcSpecification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QcInspection" (
    "id" SERIAL NOT NULL,
    "finalBatchId" INTEGER NOT NULL,
    "qcSpecificationId" INTEGER NOT NULL,
    "hardnessActual" DOUBLE PRECISION,
    "tensileActual" DOUBLE PRECISION,
    "elongationActual" DOUBLE PRECISION,
    "specificGravityActual" DOUBLE PRECISION,
    "compressionSetActual" DOUBLE PRECISION,
    "status" "QcStatus" NOT NULL,
    "remarks" TEXT,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QcInspection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QcSpecification_recipeId_key" ON "QcSpecification"("recipeId");

-- CreateIndex
CREATE INDEX "QcInspection_finalBatchId_idx" ON "QcInspection"("finalBatchId");

-- CreateIndex
CREATE INDEX "QcInspection_qcSpecificationId_idx" ON "QcInspection"("qcSpecificationId");

-- AddForeignKey
ALTER TABLE "QcSpecification" ADD CONSTRAINT "QcSpecification_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QcInspection" ADD CONSTRAINT "QcInspection_finalBatchId_fkey" FOREIGN KEY ("finalBatchId") REFERENCES "FinalBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QcInspection" ADD CONSTRAINT "QcInspection_qcSpecificationId_fkey" FOREIGN KEY ("qcSpecificationId") REFERENCES "QcSpecification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
