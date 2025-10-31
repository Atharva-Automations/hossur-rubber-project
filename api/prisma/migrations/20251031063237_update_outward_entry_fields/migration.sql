-- AlterTable
ALTER TABLE "InwardQrCode" ADD COLUMN     "outwardId" INTEGER,
ADD COLUMN     "scannedAtOutward" TIMESTAMP(3),
ADD COLUMN     "scannedAtProduction" TIMESTAMP(3),
ADD COLUMN     "state" "QrState" NOT NULL DEFAULT 'CREATED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "OutwardEntry" ADD COLUMN     "bagsIssued" INTEGER;
