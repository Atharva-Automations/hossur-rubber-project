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
}
