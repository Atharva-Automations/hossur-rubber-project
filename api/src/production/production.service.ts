import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QrState } from '@prisma/client';

@Injectable()
export class ProductionService {
  constructor(private readonly prisma: PrismaService) {}

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

    await this.prisma.inwardQrCode.update({
      where: { qrId },
      data: {
        state: QrState.CONSUMED,
        scannedAtProduction: new Date(),
      },
    });

    const ingredient = await this.prisma.ingredient.findFirst({
      where: { materialName },
    });

    if (!ingredient) {
      throw new NotFoundException(
        `No ingredient mapping found for ${materialName}.`
      );
    }

    const bin = await this.prisma.binAssignment.findUnique({
      where: { ingredientId: ingredient.id },
    });

    if (!bin) {
      throw new NotFoundException(
        `No bin assigned for ingredient ${ingredient.ingredientCode}.`
      );
    }

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

    const binNumber = Number(bin.binNumber.replace('B', ''));

    return {
      message: `QR ${qrId} consumed successfully and ${bagWeight}${qr.inward.unit} added to ${bin.binNumber}.`,
      binNumber: binNumber,
      newQuantity: newQty,
      ingredient: ingredient.name || ingredient.ingredientCode,
    };
  }
}
