/*
  Warnings:

  - Added the required column `unit` to the `InwardEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."InwardQrCode_qrId_key";

-- AlterTable
ALTER TABLE "InwardEntry" ADD COLUMN     "unit" TEXT NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;
