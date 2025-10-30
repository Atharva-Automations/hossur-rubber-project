/*
  Warnings:

  - You are about to drop the column `date` on the `InwardEntry` table. All the data in the column will be lost.
  - You are about to drop the column `qrCodes` on the `InwardEntry` table. All the data in the column will be lost.
  - You are about to drop the column `totalBags` on the `InwardEntry` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `InwardEntry` table. All the data in the column will be lost.
  - Made the column `supplierName` on table `InwardEntry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mfgDate` on table `InwardEntry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expDate` on table `InwardEntry` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "InwardEntry" DROP COLUMN "date",
DROP COLUMN "qrCodes",
DROP COLUMN "totalBags",
DROP COLUMN "unit",
ALTER COLUMN "supplierName" SET NOT NULL,
ALTER COLUMN "mfgDate" SET NOT NULL,
ALTER COLUMN "expDate" SET NOT NULL;

-- CreateTable
CREATE TABLE "InwardQrCode" (
    "id" SERIAL NOT NULL,
    "bagNo" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "qrId" TEXT NOT NULL,
    "inwardId" INTEGER NOT NULL,
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InwardQrCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InwardQrCode_qrId_key" ON "InwardQrCode"("qrId");

-- AddForeignKey
ALTER TABLE "InwardQrCode" ADD CONSTRAINT "InwardQrCode_inwardId_fkey" FOREIGN KEY ("inwardId") REFERENCES "InwardEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
