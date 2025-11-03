import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QrState } from '@prisma/client';

@Injectable()
export class OutwardService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { materialName, issuedTo, selectedQrIds = [] } = data;

    if (!materialName || !issuedTo || selectedQrIds.length === 0) {
      throw new BadRequestException(
        'Material, IssuedTo, and at least one bag (QR) are required.'
      );
    }

    // Fetch all selected QR details (still CREATED)
    const qrs = await this.prisma.inwardQrCode.findMany({
      where: { qrId: { in: selectedQrIds }, state: QrState.CREATED },
      include: { inward: true },
    });

    if (qrs.length === 0) {
      throw new BadRequestException(
        'Selected QR codes are invalid or already issued.'
      );
    }

    // Ensure same material
    const materialSet = new Set(qrs.map((q) => q.inward.materialName));
    if (materialSet.size > 1) {
      throw new BadRequestException(
        'All selected bags must belong to the same material.'
      );
    }

    const totalQty = qrs.reduce((sum, q) => sum + (q.inward.bagWeight || 0), 0);
    const unit = qrs[0].inward.unit;

    // ✅ Reduce stock immediately
    const stock = await this.prisma.materialStock.findUnique({
      where: { materialName },
    });
    if (!stock) throw new BadRequestException('Material not found in stock');
    if (stock.totalQuantity < totalQty)
      throw new BadRequestException('Not enough stock available');

    await this.prisma.materialStock.update({
      where: { materialName },
      data: { totalQuantity: { decrement: totalQty } },
    });

    // ✅ Create outward entry (keep QR states unchanged)
    const outward = await this.prisma.outwardEntry.create({
      data: {
        materialName,
        quantity: totalQty,
        unit,
        issuedTo,
        purpose: data.purpose || 'Production',
        remarks: data.remarks || '',
        status: 'Pending',
        qrScanStatus: { totalBags: qrs.length, scannedBags: 0 },
      },
    });

    return { outward, totalBags: qrs.length, totalQty };
  }

  async findAll() {
    return this.prisma.outwardEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.outwardEntry.findUnique({
      where: { id },
      // include: {
      //   // optional: if you have relations, e.g.
      //   // inwardQrCodes: true,
      // },
    });
  }

  async scanQr(outwardId: number, qrId: string) {
    const outward = await this.prisma.outwardEntry.findUnique({
      where: { id: outwardId },
    });
    if (!outward) throw new NotFoundException('Outward entry not found');

    const qr = await this.prisma.inwardQrCode.findUnique({
      where: { qrId },
      include: { inward: true },
    });
    if (!qr) throw new BadRequestException('Invalid QR code');
    if (qr.state !== QrState.CREATED)
      throw new BadRequestException('Bag already issued or consumed');

    if (qr.inward.materialName !== outward.materialName)
      throw new BadRequestException(
        `This bag belongs to ${qr.inward.materialName}, not ${outward.materialName}`
      );

    // ✅ Mark bag as issued
    await this.prisma.inwardQrCode.update({
      where: { qrId },
      data: {
        state: QrState.ISSUED,
        outwardId,
        scannedAtOutward: new Date(),
      },
    });

    // ✅ Progress tracking
    const totalBags = (outward.qrScanStatus as any)?.totalBags || 0;
    const scannedBags = await this.prisma.inwardQrCode.count({
      where: { outwardId, state: QrState.ISSUED },
    });

    const isComplete = totalBags > 0 && scannedBags >= totalBags;

    await this.prisma.outwardEntry.update({
      where: { id: outwardId },
      data: {
        qrScanStatus: { totalBags, scannedBags },
        ...(isComplete ? { status: 'Completed' } : {}),
      },
    });

    return {
      message: `Bag ${qr.bagNo} scanned successfully.`,
      scannedBags,
      totalBags,
      status: isComplete ? 'Completed' : 'Pending',
    };
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
