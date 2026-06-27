/*
  Warnings:

  - You are about to drop the column `inwardQrCodeId` on the `WeighedBag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."WeighedBag" DROP CONSTRAINT "WeighedBag_inwardQrCodeId_fkey";

-- AlterTable
ALTER TABLE "WeighedBag" DROP COLUMN "inwardQrCodeId";
