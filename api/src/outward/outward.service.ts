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
    const issuedTo = dto.issuedTo.trim();

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    if (!dto.inwardId) {
      throw new BadRequestException('Inward entry ID is required');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Find the inward entry
      const inward = await tx.inwardEntry.findUnique({
        where: { id: dto.inwardId },
        include: { qrCodes: true },
      });

      if (!inward) {
        throw new BadRequestException('Inward entry not found');
      }

      // 2. Validate selected QR codes belong to this inward entry
      if (dto.selectedQrIds && dto.selectedQrIds.length > 0) {
        const selectedQrs = await tx.inwardQrCode.findMany({
          where: { qrId: { in: dto.selectedQrIds } },
        });

        // Check all selected QRs belong to the same inward entry
        const invalidQrs = selectedQrs.filter(
          (qr) => qr.inwardId !== dto.inwardId
        );
        if (invalidQrs.length > 0) {
          throw new BadRequestException(
            `Selected QR codes do not belong to the selected material entry. Invalid QRs: ${invalidQrs
              .map((q) => q.qrId)
              .join(', ')}`
          );
        }

        // Check all selected QRs are in CREATED state
        const notCreatedQrs = selectedQrs.filter(
          (qr) => qr.state !== QrState.CREATED
        );
        if (notCreatedQrs.length > 0) {
          throw new BadRequestException(
            `Some selected bags have already been issued or consumed: ${notCreatedQrs
              .map((q) => q.qrId)
              .join(', ')}`
          );
        }
      }

      // 3. Find stock (case-insensitive)
      const stock = await tx.materialStock.findFirst({
        where: {
          materialName: { equals: inward.materialName, mode: 'insensitive' },
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

      // 4. Decrement stock
      await tx.materialStock.update({
        where: { id: stock.id },
        data: {
          totalQuantity: { decrement: dto.quantity },
          updatedAt: new Date(),
        },
      });

      // 5. Create outward entry
      const outward = await tx.outwardEntry.create({
        data: {
          materialName: inward.materialName, // canonical name
          quantity: dto.quantity,
          unit: inward.unit,
          issuedTo,
          purpose: dto.purpose ?? 'Production',
          remarks:
            dto.remarks ??
            `Issued from ${inward.supplierName} - ${inward.bagWeight}${inward.unit} bags`,
          status: 'Pending',
          qrScanStatus: {
            totalBags: dto.selectedQrIds?.length || null,
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
    console.log('\n========== 📱 QR SCAN REQUEST RECEIVED ==========');
    console.log('🔍 Scanning QR:', qrId);
    console.log('📦 For Outward ID:', outwardId);
    console.log('⏱️  Backend Timestamp:', new Date().toISOString());

    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch outward with current scan status
      console.log('🔎 Looking up outward entry...');
      const outward = await tx.outwardEntry.findUnique({
        where: { id: outwardId },
      });
      if (!outward) {
        console.log('❌ Outward entry not found for ID:', outwardId);
        throw new NotFoundException('Outward entry not found');
      }
      console.log('✅ Outward found:', {
        id: outward.id,
        materialName: outward.materialName,
      });

      // 2. Fetch QR with related inward data
      console.log('🔎 Looking up QR code...');
      const qr = await tx.inwardQrCode.findUnique({
        where: { qrId },
        include: { inward: true },
      });

      if (!qr) {
        console.log('❌ QR code not found in database:', qrId);
        throw new BadRequestException('Invalid QR code - no such bag exists');
      }
      console.log('✅ QR found:', {
        qrId: qr.qrId,
        state: qr.state,
        inwardId: qr.inwardId,
      });

      // 3. Validate QR state
      console.log('🔍 Validating QR state...');
      if (qr.state === QrState.ISSUED) {
        console.log('⚠️  QR already ISSUED');
        throw new BadRequestException(
          'This bag is already scanned for outward dispatch'
        );
      }

      if (qr.state === QrState.CONSUMED) {
        console.log('⚠️  QR already CONSUMED');
        throw new BadRequestException('This bag is already used in production');
      }

      if (qr.state !== QrState.CREATED) {
        console.log('⚠️  QR invalid state:', qr.state);
        throw new BadRequestException(
          `Invalid QR state: ${qr.state}. Only CREATED bags can be scanned`
        );
      }

      // 4. Validate material match
      console.log('🔍 Validating material match...');
      if (qr.inward.materialName !== outward.materialName) {
        console.log('❌ Material mismatch:', {
          qrMaterial: qr.inward.materialName,
          outwardMaterial: outward.materialName,
        });
        throw new BadRequestException(
          `This QR belongs to ${qr.inward.materialName}, but this outward is for ${outward.materialName}`
        );
      }
      console.log('✅ Material match verified:', qr.inward.materialName);

      // 5. Mark QR as issued
      console.log('🔄 Updating QR state to ISSUED...');
      await tx.inwardQrCode.update({
        where: { qrId },
        data: {
          state: QrState.ISSUED,
          outwardId,
          scannedAtOutward: new Date(),
        },
      });
      console.log('✅ QR state updated to ISSUED');

      // 6. Count total bags available for this outward (all CREATED bags from same material/supplier)
      const totalBagsAvailable = await tx.inwardQrCode.count({
        where: {
          inward: {
            materialName: outward.materialName,
          },
          state: QrState.CREATED,
        },
      });

      // 7. Count already scanned bags for this outward
      console.log('🔢 Counting scanned bags...');
      const scannedBags = await tx.inwardQrCode.count({
        where: { outwardId, state: QrState.ISSUED },
      });
      console.log(`📊 Scan count: ${scannedBags}/${outward.bagsIssued}`);

      // 8. Update outward scan progress
      const currentStatus =
        scannedBags >= outward.bagsIssued! ? 'Completed' : 'Pending';
      console.log('🔄 Updating outward status to:', currentStatus);

      await tx.outwardEntry.update({
        where: { id: outwardId },
        data: {
          qrScanStatus: {
            scannedBags,
            totalBags: outward.bagsIssued,
            lastScannedQrId: qrId,
            lastScannedAt: new Date(),
          },
          status: currentStatus,
        },
      });
      console.log('✅ Outward updated successfully');

      console.log('========== END QR SCAN ==========\n');
      return {
        message: `QR ${qrId} scanned successfully`,
        scannedBags,
        totalBags: outward.bagsIssued,
        status: currentStatus,
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
