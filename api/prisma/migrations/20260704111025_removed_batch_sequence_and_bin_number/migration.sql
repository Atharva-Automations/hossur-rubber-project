/*
  Warnings:

  - You are about to drop the column `batchSequence` on the `ExecutionIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `binNumber` on the `ExecutionIngredient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ExecutionIngredient" DROP COLUMN "batchSequence",
DROP COLUMN "binNumber";
