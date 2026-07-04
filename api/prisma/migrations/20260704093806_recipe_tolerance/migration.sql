/*
  Warnings:

  - Added the required column `plcIngredientIndex` to the `BatchIngredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tolerance` to the `BatchIngredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tolerance` to the `StepIngredient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BatchIngredient" ADD COLUMN     "plcIngredientIndex" INTEGER NOT NULL,
ADD COLUMN     "tolerance" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "RecipeStep" ALTER COLUMN "pressure" DROP NOT NULL,
ALTER COLUMN "temperature" DROP NOT NULL,
ALTER COLUMN "rpm" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StepIngredient" ADD COLUMN     "tolerance" DOUBLE PRECISION NOT NULL;
