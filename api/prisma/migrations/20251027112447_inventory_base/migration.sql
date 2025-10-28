-- CreateTable
CREATE TABLE "RawMaterial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uom" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RawLot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rawMaterialId" INTEGER NOT NULL,
    "supplier" TEXT,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qtyReceived" REAL NOT NULL,
    "qtyOnHand" REAL NOT NULL,
    "expiryDate" DATETIME,
    "qrCode" TEXT NOT NULL,
    "binId" INTEGER,
    CONSTRAINT "RawLot_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RawLot_binId_fkey" FOREIGN KEY ("binId") REFERENCES "Bin" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryTxn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lotId" INTEGER NOT NULL,
    "txnType" TEXT NOT NULL,
    "qty" REAL NOT NULL,
    "at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ref" TEXT,
    "userId" INTEGER,
    CONSTRAINT "InventoryTxn_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "RawLot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "ingredientId" INTEGER,
    "minQty" REAL,
    "maxQty" REAL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Bin_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterial_code_key" ON "RawMaterial"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RawLot_qrCode_key" ON "RawLot"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "Bin_code_key" ON "Bin"("code");
