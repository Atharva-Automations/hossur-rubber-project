/*
  Warnings:

  - You are about to drop the column `bagsIssued` on the `OutwardEntry` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[qrId]` on the table `InwardQrCode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `issuedTo` to the `OutwardEntry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QrState" AS ENUM ('CREATED', 'ISSUED', 'CONSUMED');

-- AlterTable
ALTER TABLE "OutwardEntry" DROP COLUMN "bagsIssued",
ADD COLUMN     "issuedTo" TEXT NOT NULL,
ADD COLUMN     "purpose" TEXT,
ADD COLUMN     "remarks" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "InwardQrCode_qrId_key" ON "InwardQrCode"("qrId");
