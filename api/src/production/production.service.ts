import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QrState } from '@prisma/client';

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Handles QR scan at the production line.
   * It checks if the QR exists, ensures it was issued,
   * and marks it as CONSUMED (used in production).
   */
  async scanAtProduction(qrId: string) {
    // 1️⃣ Fetch QR with its related inward entry
    const qr = await this.prisma.inwardQrCode.findUnique({
      where: { qrId },
      include: { inward: true },
    });

    if (!qr) {
      throw new NotFoundException('Invalid QR code. Bag not found.');
    }

    // 2️⃣ Check current QR state
    if (qr.state === QrState.CONSUMED) {
      throw new BadRequestException(
        'This bag is already scanned for production.'
      );
    }

    if (qr.state !== QrState.ISSUED) {
      throw new BadRequestException(
        `Invalid QR state. Only issued bags can be scanned for production. Current state: ${qr.state}`
      );
    }

    // 3️⃣ Update QR state → CONSUMED
    const updatedQr = await this.prisma.inwardQrCode.update({
      where: { qrId },
      data: {
        state: QrState.CONSUMED,
        scannedAtProduction: new Date(),
      },
    });

    // 4️⃣ (Future logic) Update bin & ingredient stock — to be done in next step
    // We'll handle it later when bins are linked to ingredients.

    return {
      message: `QR ${qr.qrId} (${qr.inward.materialName}) scanned successfully for production.`,
      updatedQr,
    };
  }

  async scanQr(qrId: string) {
    const qr = await this.prisma.inwardQrCode.findUnique({
      where: { qrId },
      include: {
        inward: true,
      },
    });

    if (!qr) throw new NotFoundException('Invalid QR ID');
    if (qr.state !== QrState.ISSUED)
      throw new BadRequestException('QR must be in ISSUED state to consume.');

    const materialName = qr.inward.materialName;

    // ✅ Step 1: Mark QR as CONSUMED
    await this.prisma.inwardQrCode.update({
      where: { qrId },
      data: {
        state: QrState.CONSUMED,
        scannedAtProduction: new Date(),
      },
    });

    // ✅ Step 2: Find the ingredient linked to this material
    const ingredient = await this.prisma.ingredient.findFirst({
      where: { materialName },
    });

    if (!ingredient) {
      throw new NotFoundException(
        `No ingredient mapping found for ${materialName}.`
      );
    }

    // ✅ Step 3: Find the bin assigned to this ingredient
    const bin = await this.prisma.binAssignment.findUnique({
      where: { ingredientId: ingredient.id },
    });

    if (!bin) {
      throw new NotFoundException(
        `No bin assigned for ingredient ${ingredient.ingredientCode}.`
      );
    }

    // ✅ Step 4: Increase bin’s currentQuantity
    // Fetch bag weight from inward entry (each bag)
    const bagWeight = qr.inward.bagWeight || 0;

    const newQty = bin.currentQuantity + bagWeight;
    if (newQty > bin.maxQuantity) {
      throw new BadRequestException(
        `Cannot add ${bagWeight} ${qr.inward.unit} to bin ${bin.binNumber}. Exceeds max capacity (${bin.maxQuantity}).`
      );
    }

    await this.prisma.binAssignment.update({
      where: { id: bin.id },
      data: {
        currentQuantity: newQty,
        updatedAt: new Date(),
      },
    });

    return {
      message: `QR ${qrId} consumed successfully and ${bagWeight}${qr.inward.unit} added to ${bin.binNumber}.`,
      binNumber: bin.binNumber,
      newQuantity: newQty,
      ingredient: ingredient.name || ingredient.ingredientCode,
    };
  }
}
