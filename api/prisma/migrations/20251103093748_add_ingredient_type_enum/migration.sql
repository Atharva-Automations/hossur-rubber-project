/*
  Warnings:

  - Added the required column `type` to the `Ingredient` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IngredientType" AS ENUM ('BASE_POLYMER', 'FILLER', 'ACTIVATOR', 'ACCELERATOR', 'CURING_AGENT', 'PROCESSING_AID', 'PIGMENT', 'OTHER');

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "type" "IngredientType" NOT NULL;
