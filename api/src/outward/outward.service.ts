import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOutwardDto } from './dto/create-outward.dto';
import { UpdateOutwardDto } from './dto/update-outward.dto';

@Injectable()
export class OutwardService {
  constructor(private prisma: PrismaService) {}

  // ---------- CREATE ----------
  async create(dto: CreateOutwardDto) {
    const stock = await this.prisma.materialStock.findUnique({
      where: { materialName: dto.materialName },
    });

    if (!stock) throw new BadRequestException('Material not found in stock');
    if (stock.totalQuantity < dto.quantity)
      throw new BadRequestException('Insufficient stock available');

    const outward = await this.prisma.outwardEntry.create({
      data: {
        materialName: dto.materialName,
        quantity: dto.quantity,
        unit: dto.unit,
        issuedTo: dto.issuedTo,
        purpose: dto.purpose ?? '',
        remarks: dto.remarks ?? '',
        status: 'Pending',
      },
    });

    return outward;
  }

  // ---------- FIND ----------
  async findAll() {
    return this.prisma.outwardEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const entry = await this.prisma.outwardEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Outward entry not found');
    return entry;
  }

  // ---------- UPDATE ----------
  async update(id: number, dto: UpdateOutwardDto) {
    const entry = await this.prisma.outwardEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Outward entry not found');

    return this.prisma.outwardEntry.update({
      where: { id },
      data: dto,
    });
  }

  // ---------- DELETE ----------
  async remove(id: number) {
    await this.prisma.outwardEntry.delete({ where: { id } });
    return { ok: true };
  }

  // ---------- QR SCAN ----------
  async scanQr(outwardId: number, qrId: string) {
    const outward = await this.prisma.outwardEntry.findUnique({
      where: { id: outwardId },
    });
    if (!outward) throw new NotFoundException('Outward entry not found');

    const qr = await this.prisma.inwardQrCode.findUnique({
      where: { qrId: qrId }, // ✅ now valid
      include: { inward: true }, // ✅ load related inward entry
    });

    if (!qr) throw new BadRequestException('Invalid QR code');
    if (!qr.printed) throw new BadRequestException('QR not printed yet');
    if (qr.inward.materialName !== outward.materialName)
      throw new BadRequestException('QR material mismatch');

    // ✅ Mark QR as issued
    await this.prisma.inwardQrCode.update({
      where: { qrId: qrId },
      data: { printed: true },
    });

    const newScan = {
      qrId,
      bagNo: qr.bagNo,
      scannedAt: new Date().toISOString(),
    };

    const updatedStatus = Array.isArray(outward.qrScanStatus)
      ? [...outward.qrScanStatus, newScan]
      : [newScan];

    await this.prisma.outwardEntry.update({
      where: { id: outwardId },
      data: { qrScanStatus: updatedStatus },
    });

    return { success: true, scanned: newScan };
  }

  // ---------- COMPLETE ----------
  async complete(outwardId: number) {
    const outward = await this.findOne(outwardId);
    if (outward.status === 'Completed')
      throw new BadRequestException('Already completed');

    // Deduct stock
    await this.prisma.materialStock.update({
      where: { materialName: outward.materialName },
      data: {
        totalQuantity: { decrement: outward.quantity },
      },
    });

    await this.prisma.outwardEntry.update({
      where: { id: outwardId },
      data: { status: 'Completed' },
    });

    return {
      success: true,
      message: 'Outward marked as completed and stock updated',
    };
  }
}
