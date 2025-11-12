-- CreateEnum
CREATE TYPE "QrState" AS ENUM ('CREATED', 'ISSUED', 'CONSUMED');

-- CreateEnum
CREATE TYPE "IngredientType" AS ENUM ('BASE_POLYMER', 'FILLER', 'ACTIVATOR', 'ACCELERATOR', 'CURING_AGENT', 'PROCESSING_AID', 'PIGMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "StepType" AS ENUM ('KNEADER', 'MIXING');

-- CreateTable
CREATE TABLE "InwardEntry" (
    "id" SERIAL NOT NULL,
    "materialName" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "bagWeight" DOUBLE PRECISION,
    "storedAsWhole" BOOLEAN NOT NULL DEFAULT false,
    "mfgDate" TIMESTAMP(3) NOT NULL,
    "expDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InwardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InwardQrCode" (
    "id" SERIAL NOT NULL,
    "qrId" TEXT NOT NULL,
    "bagNo" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "inwardId" INTEGER NOT NULL,
    "state" "QrState" NOT NULL DEFAULT 'CREATED',
    "outwardId" INTEGER,
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "scannedAtOutward" TIMESTAMP(3),
    "scannedAtProduction" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InwardQrCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutwardEntry" (
    "id" SERIAL NOT NULL,
    "materialName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'KG',
    "issuedTo" TEXT NOT NULL,
    "purpose" TEXT,
    "remarks" TEXT,
    "qrScanStatus" JSONB,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "bagsIssued" INTEGER,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutwardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialStock" (
    "id" SERIAL NOT NULL,
    "materialName" TEXT NOT NULL,
    "totalQuantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" SERIAL NOT NULL,
    "ingredientCode" TEXT NOT NULL,
    "name" TEXT,
    "type" "IngredientType" NOT NULL,
    "materialName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BinAssignment" (
    "id" SERIAL NOT NULL,
    "binNumber" TEXT NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "minQuantity" DOUBLE PRECISION NOT NULL,
    "maxQuantity" DOUBLE PRECISION NOT NULL,
    "currentQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BinAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "recipeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeStep" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "stepType" "StepType" NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "timerSeconds" INTEGER NOT NULL,
    "pressure" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "rpm" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RecipeStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepIngredient" (
    "id" SERIAL NOT NULL,
    "stepId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "StepIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InwardQrCode_qrId_key" ON "InwardQrCode"("qrId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialStock_materialName_key" ON "MaterialStock"("materialName");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_ingredientCode_key" ON "Ingredient"("ingredientCode");

-- CreateIndex
CREATE UNIQUE INDEX "BinAssignment_binNumber_key" ON "BinAssignment"("binNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BinAssignment_ingredientId_key" ON "BinAssignment"("ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_recipeCode_key" ON "Recipe"("recipeCode");

-- AddForeignKey
ALTER TABLE "InwardQrCode" ADD CONSTRAINT "InwardQrCode_inwardId_fkey" FOREIGN KEY ("inwardId") REFERENCES "InwardEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BinAssignment" ADD CONSTRAINT "BinAssignment_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeStep" ADD CONSTRAINT "RecipeStep_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepIngredient" ADD CONSTRAINT "StepIngredient_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "RecipeStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepIngredient" ADD CONSTRAINT "StepIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
