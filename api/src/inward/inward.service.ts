import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInwardDto } from './dto/create-inward.dto';
import { UpdateInwardDto } from './dto/update-inward.dto';
import { QrState, Prisma } from '@prisma/client';

type PrismaTransactionClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class InwardService {
  constructor(private readonly prisma: PrismaService) {}

  private computeStatus(expDate: Date) {
    const today = new Date();
    const t = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).getTime();
    const e = new Date(
      expDate.getFullYear(),
      expDate.getMonth(),
      expDate.getDate()
    ).getTime();

    return e < t ? 'Expired' : 'Active';
  }

  private buildQrList(inward: {
    id: number;
    materialName: string;
    quantity: number;
    bagWeight: number | null;
    storedAsWhole: boolean;
  }) {
    const list: { bagNo: number; label: string; qrId: string }[] = [];

    if (inward.storedAsWhole) {
      const formattedQrId = `MT-${String(inward.id).padStart(5, '0')}-FULL`;

      list.push({
        bagNo: 1,
        label: `${inward.materialName} - Full Lot`,
        qrId: formattedQrId,
      });

      return list;
    }

    const bagW = inward.bagWeight ?? 1;
    const totalBags = Math.max(1, Math.ceil(inward.quantity / bagW));

    for (let i = 1; i <= totalBags; i++) {
      const formattedQrId = `INW-${String(inward.id).padStart(5, '0')}-${String(
        i
      ).padStart(4, '0')}`;

      list.push({
        bagNo: i,
        label: `${inward.materialName} - Bag ${i}`,
        qrId: formattedQrId,
      });
    }

    return list;
  }

  // ---------- STOCK MANAGEMENT HELPERS ----------

  private async incrementStock(
    materialName: string,
    unit: string,
    quantity: number,
    tx: PrismaTransactionClient | Prisma.TransactionClient = this.prisma
  ) {
    await tx.materialStock.upsert({
      where: { materialName },
      update: {
        totalQuantity: { increment: quantity },
        updatedAt: new Date(),
      },
      create: {
        materialName,
        totalQuantity: quantity,
        unit,
      },
    });
  }

  private async decrementStock(
    materialName: string,
    quantity: number,
    tx: PrismaTransactionClient | Prisma.TransactionClient = this.prisma
  ) {
    const stock = await tx.materialStock.findUnique({
      where: { materialName },
    });
    if (!stock) {
      return;
    }

    await tx.materialStock.update({
      where: { materialName },
      data: { totalQuantity: { decrement: quantity }, updatedAt: new Date() },
    });
  }

  private async adjustStockOnEdit(
    oldMaterial: string,
    newMaterial: string,
    oldQty: number,
    newQty: number,
    unit: string,
    tx: PrismaTransactionClient | Prisma.TransactionClient
  ) {
    if (oldMaterial === newMaterial) {
      const diff = newQty - oldQty;
      if (diff !== 0) {
        // ensure record exists
        const s = await tx.materialStock.findUnique({
          where: { materialName: oldMaterial },
        });
        if (s) {
          await tx.materialStock.update({
            where: { materialName: oldMaterial },
            data: { totalQuantity: { increment: diff }, updatedAt: new Date() },
          });
        } else {
          await tx.materialStock.create({
            data: {
              materialName: oldMaterial,
              totalQuantity: diff > 0 ? diff : 0,
              unit,
            },
          });
        }
      }
    } else {
      // decrement old
      const oldStock = await tx.materialStock.findUnique({
        where: { materialName: oldMaterial },
      });
      if (oldStock) {
        await tx.materialStock.update({
          where: { materialName: oldMaterial },
          data: { totalQuantity: { decrement: oldQty }, updatedAt: new Date() },
        });
      }
      // increment/create new
      await this.incrementStock(newMaterial, unit, newQty, tx);
    }
  }

  async create(dto: CreateInwardDto) {
    const materialName = dto.materialName.trim();
    const expDate = new Date(dto.expDate);
    const storedAsWhole = dto.storedAsWhole ?? false;
    const bagWeight = storedAsWhole ? null : dto.bagWeight ?? null;

    const newInward = await this.prisma.$transaction(async (tx) => {
      // 1. Create Inward Entry
      const inward = await tx.inwardEntry.create({
        data: {
          materialName,
          supplierName: dto.supplierName.trim(),
          quantity: dto.quantity,
          unit: dto.unit,
          bagWeight: bagWeight,
          storedAsWhole: storedAsWhole,
          mfgDate: new Date(dto.mfgDate),
          expDate: expDate,
          status: this.computeStatus(expDate),
        },
      });

      // 2. Update Stock
      await this.incrementStock(materialName, dto.unit, dto.quantity, tx);

      // 3. Create QR Codes
      const qrList = this.buildQrList(inward);
      if (qrList.length) {
        await tx.inwardQrCode.createMany({
          data: qrList.map((qr) => ({
            ...qr,
            inwardId: inward.id,
            state: QrState.CREATED,
            printed: false,
          })),
        });
      }

      return inward;
    });

    return this.findOne(newInward.id);
  }

  async update(id: number, dto: UpdateInwardDto) {
    const existing = await this.prisma.inwardEntry.findUnique({
      where: { id },
      include: { qrCodes: true },
    });
    if (!existing) throw new NotFoundException('Inward entry not found');

    const mfg = dto.mfgDate ? new Date(dto.mfgDate) : existing.mfgDate;
    const exp = dto.expDate ? new Date(dto.expDate) : existing.expDate;
    const status = this.computeStatus(exp);

    const newStoredAsWhole = dto.storedAsWhole ?? existing.storedAsWhole;

    const newBagWeight =
      newStoredAsWhole === true ? null : dto.bagWeight ?? existing.bagWeight;

    const bagLogicChanged =
      (dto.quantity !== undefined && dto.quantity !== existing.quantity) ||
      (dto.bagWeight !== undefined && dto.bagWeight !== existing.bagWeight) ||
      (dto.storedAsWhole !== undefined &&
        dto.storedAsWhole !== existing.storedAsWhole);

    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Update Inward Entry
      const updatedEntry = await tx.inwardEntry.update({
        where: { id },
        data: {
          materialName: dto.materialName?.trim() ?? existing.materialName,
          supplierName: dto.supplierName?.trim() ?? existing.supplierName,
          quantity: dto.quantity ?? existing.quantity,
          unit: dto.unit ?? existing.unit,
          bagWeight: newBagWeight,
          storedAsWhole: newStoredAsWhole,
          mfgDate: mfg,
          expDate: exp,
          status,
        },
      });

      // 2. Adjust Stock
      await this.adjustStockOnEdit(
        existing.materialName,
        dto.materialName ?? existing.materialName,
        existing.quantity,
        dto.quantity ?? existing.quantity,
        dto.unit ?? existing.unit,
        tx
      );

      if (bagLogicChanged) {
        await tx.inwardQrCode.deleteMany({ where: { inwardId: id } });
        const qrList = this.buildQrList(updatedEntry);
        if (qrList.length) {
          await tx.inwardQrCode.createMany({
            data: qrList.map((qr) => ({
              ...qr,
              inwardId: id,
              state: QrState.CREATED,
              printed: false,
            })),
          });
        }
      }
      return updatedEntry;
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    const existing = await this.prisma.inwardEntry.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Inward entry not found');

    await this.prisma.$transaction(async (tx) => {
      // 1. Delete QR codes
      await tx.inwardQrCode.deleteMany({ where: { inwardId: id } });
      // 2. Delete Inward entry
      await tx.inwardEntry.delete({ where: { id } });
      // 3. Decrement Stock
      await this.decrementStock(existing.materialName, existing.quantity, tx);
    });

    return { ok: true };
  }

  // --- Retrieval Methods ---

  async findAll() {
    return this.prisma.inwardEntry.findMany({
      include: { qrCodes: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const inward = await this.prisma.inwardEntry.findUnique({
      where: { id },
      include: { qrCodes: true },
    });
    if (!inward) throw new NotFoundException('Inward entry not found');
    return inward;
  }

  async getQrCodesByInward(inwardId: number) {
    const inward = await this.prisma.inwardEntry.findUnique({
      where: { id: inwardId },
      include: { qrCodes: true },
    });
    if (!inward)
      throw new NotFoundException(`Inward entry ${inwardId} not found`);

    return inward.qrCodes.map((qr) => ({
      bagNo: qr.bagNo,
      label: qr.label,
      qrId: qr.qrId,
      printed: qr.printed,
    }));
  }

  async getStock() {
    return this.prisma.materialStock.findMany({
      orderBy: { materialName: 'asc' },
    });
  }

  async getAnalytics() {
    const all = await this.prisma.inwardEntry.findMany();

    const totalMaterials = all.length;
    const active = all.filter((r) => r.status === 'Active').length;
    const expired = all.filter((r) => r.status === 'Expired').length;

    const supplierMap = new Map<string, number>();
    for (const r of all) {
      const current = supplierMap.get(r.supplierName) ?? 0;
      supplierMap.set(r.supplierName, current + r.quantity);
    }

    const topSuppliers = Array.from(supplierMap.entries())
      .map(([supplier, qty]) => ({ supplier, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return { totalMaterials, active, expired, topSuppliers };
  }

  async findAllFiltered(
    search?: string,
    status?: string,
    sort: 'asc' | 'desc' = 'desc'
  ) {
    return this.prisma.inwardEntry.findMany({
      where: {
        AND: [
          search
            ? {
                materialName: {
                  contains: search,
                  mode: 'insensitive',
                },
              }
            : {},
          status && status !== 'All' ? { status } : {},
        ],
      },
      orderBy: { createdAt: sort },
    });
  }

  async getMaterials() {
    const rows = await this.prisma.inwardEntry.findMany({
      distinct: ['materialName'],
      select: { materialName: true },
      orderBy: { materialName: 'asc' },
    });
    return rows.map((r) => r.materialName);
  }

  async getSuppliers() {
    const rows = await this.prisma.inwardEntry.findMany({
      distinct: ['supplierName'],
      select: { supplierName: true },
      orderBy: { supplierName: 'asc' },
    });
    return rows.map((r) => r.supplierName);
  }

  async getAvailableBags(material: string) {
    return this.prisma.inwardQrCode.findMany({
      where: {
        inward: { materialName: material },
        state: QrState.CREATED,
      },
      select: {
        qrId: true,
        bagNo: true,
        inward: {
          select: {
            bagWeight: true,
            unit: true,
          },
        },
      },
      orderBy: { bagNo: 'asc' },
    });
  }
}
