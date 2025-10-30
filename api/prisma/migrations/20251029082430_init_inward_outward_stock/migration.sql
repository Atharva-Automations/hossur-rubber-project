-- CreateTable
CREATE TABLE "InwardEntry" (
    "id" SERIAL NOT NULL,
    "materialName" TEXT NOT NULL,
    "supplierName" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'KG',
    "bagWeight" DOUBLE PRECISION,
    "totalBags" INTEGER,
    "storedAsWhole" BOOLEAN NOT NULL DEFAULT false,
    "mfgDate" TIMESTAMP(3),
    "expDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Active',
    "qrCodes" JSONB,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InwardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutwardEntry" (
    "id" SERIAL NOT NULL,
    "materialName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'KG',
    "bagsIssued" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "qrScanStatus" JSONB,
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
    "unit" TEXT NOT NULL DEFAULT 'KG',
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaterialStock_materialName_key" ON "MaterialStock"("materialName");
