import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QrState } from '@prisma/client';
import { CreateOutwardDto } from './dto/create-outward.dto';

@Injectable()
export class OutwardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOutwardDto) {
    const materialName = dto.materialName.trim();
    const issuedTo = dto.issuedTo.trim();

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Find stock (case-insensitive)
      const stock = await tx.materialStock.findFirst({
        where: {
          materialName: { equals: materialName, mode: 'insensitive' },
        },
      });

      if (!stock) {
        throw new BadRequestException('Material not found in stock');
      }

      if (stock.totalQuantity < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${stock.totalQuantity}`
        );
      }

      // 2. Decrement stock
      await tx.materialStock.update({
        where: { id: stock.id },
        data: {
          totalQuantity: { decrement: dto.quantity },
          updatedAt: new Date(),
        },
      });

      // 3. Create outward entry
      const outward = await tx.outwardEntry.create({
        data: {
          materialName: stock.materialName, // canonical name
          quantity: dto.quantity,
          unit: stock.unit,
          issuedTo,
          purpose: dto.purpose ?? 'Production',
          remarks: dto.remarks ?? '',
          status: 'Pending',
          qrScanStatus: {
            totalBags: null, // unknown until scans happen
            scannedBags: 0,
          },
        },
      });

      return outward;
    });
  }

  async findAll() {
    return this.prisma.outwardEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.outwardEntry.findUnique({
      where: { id },
    });
  }

  async scanQr(outwardId: number, qrId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch outward
      const outward = await tx.outwardEntry.findUnique({
        where: { id: outwardId },
      });
      if (!outward) {
        throw new NotFoundException('Outward entry not found');
      }

      // 2. Fetch QR
      const qr = await tx.inwardQrCode.findUnique({
        where: { qrId },
        include: { inward: true },
      });

      if (!qr) {
        throw new BadRequestException('Invalid QR code');
      }

      if (qr.state !== QrState.CREATED) {
        throw new BadRequestException('QR already issued or consumed');
      }

      if (qr.inward.materialName !== outward.materialName) {
        throw new BadRequestException(
          `QR belongs to ${qr.inward.materialName}, not ${outward.materialName}`
        );
      }

      // 3. Mark QR as issued
      await tx.inwardQrCode.update({
        where: { qrId },
        data: {
          state: QrState.ISSUED,
          outwardId,
          scannedAtOutward: new Date(),
        },
      });

      // 4. Update outward scan progress
      const scannedBags = await tx.inwardQrCode.count({
        where: { outwardId, state: QrState.ISSUED },
      });

      await tx.outwardEntry.update({
        where: { id: outwardId },
        data: {
          qrScanStatus: {
            scannedBags,
          },
        },
      });

      return {
        message: `QR ${qrId} issued successfully`,
        scannedBags,
        status: outward.status,
      };
    });
  }

  async getAnalytics() {
    const total = await this.prisma.outwardEntry.count();
    const pending = await this.prisma.outwardEntry.count({
      where: { status: 'Pending' },
    });
    const completed = await this.prisma.outwardEntry.count({
      where: { status: 'Completed' },
    });
    return { total, pending, completed };
  }
}
