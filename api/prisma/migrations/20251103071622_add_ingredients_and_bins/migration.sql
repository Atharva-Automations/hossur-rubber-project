-- CreateTable
CREATE TABLE "Ingredient" (
    "id" SERIAL NOT NULL,
    "ingredientCode" TEXT NOT NULL,
    "name" TEXT,
    "materialName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BinAssignment" (
    "id" SERIAL NOT NULL,
    "binNumber" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "minQuantity" DOUBLE PRECISION NOT NULL,
    "maxQuantity" DOUBLE PRECISION NOT NULL,
    "currentQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BinAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_ingredientCode_key" ON "Ingredient"("ingredientCode");

-- CreateIndex
CREATE UNIQUE INDEX "BinAssignment_binNumber_key" ON "BinAssignment"("binNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BinAssignment_ingredientId_key" ON "BinAssignment"("ingredientId");

-- AddForeignKey
ALTER TABLE "BinAssignment" ADD CONSTRAINT "BinAssignment_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
