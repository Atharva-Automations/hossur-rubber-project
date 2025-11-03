// api/src/inward/inward.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInwardDto } from './dto/create-inward.dto';
import { UpdateInwardDto } from './dto/update-inward.dto';

@Injectable()
export class InwardService {
  constructor(private readonly prisma: PrismaService) {}

  private computeStatus(expDate: Date) {
    const today = new Date();
    // normalize to date-only comparison
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const e = new Date(
      expDate.getFullYear(),
      expDate.getMonth(),
      expDate.getDate()
    );
    return e < t ? 'Expired' : 'Active';
  }

  async create(dto: CreateInwardDto) {
    // const mfg = new Date(dto.mfgDate);
    // const exp = new Date(dto.expDate);
    // const status = this.computeStatus(exp);

    // Inside create()
    const inward = await this.prisma.inwardEntry.create({
      data: {
        materialName: dto.materialName.trim(),
        supplierName: dto.supplierName.trim(),
        quantity: dto.quantity,
        unit: dto.unit,
        bagWeight: dto.bagWeight ?? null,
        storedAsWhole: dto.storedAsWhole ?? false,
        mfgDate: new Date(dto.mfgDate),
        expDate: new Date(dto.expDate),
        status: this.computeStatus(new Date(dto.expDate)),
      },
    });

    await this.incrementStock(dto.materialName, dto.unit, dto.quantity);

    const qrList = this.buildQrList(inward);
    if (qrList.length) {
      await this.prisma.inwardQrCode.createMany({
        data: qrList.map((qr) => ({
          ...qr,
          inwardId: inward.id,
          state: 'CREATED',
          printed: false,
        })),
      });
    }

    return this.findOne(inward.id);
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
      list.push({
        bagNo: 1,
        label: `${inward.materialName} - Full Lot`,
        qrId: `QR-${inward.id}-1`,
      });
      return list;
    }

    const bagW = inward.bagWeight ?? 1;
    const totalBags = Math.max(1, Math.ceil(inward.quantity / bagW));
    for (let i = 1; i <= totalBags; i++) {
      list.push({
        bagNo: i,
        label: `${inward.materialName} - Bag ${i}`,
        qrId: `QR-${inward.id}-${i}`,
      });
    }
    return list;
  }

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

  async update(id: number, dto: UpdateInwardDto) {
    const existing = await this.prisma.inwardEntry.findUnique({
      where: { id },
      include: { qrCodes: true },
    });
    if (!existing) throw new NotFoundException('Inward entry not found');

    const mfg = dto.mfgDate ? new Date(dto.mfgDate) : existing.mfgDate;
    const exp = dto.expDate ? new Date(dto.expDate) : existing.expDate;
    const status = this.computeStatus(exp);

    const updated = await this.prisma.inwardEntry.update({
      where: { id },
      data: {
        materialName: dto.materialName?.trim() ?? existing.materialName,
        supplierName: dto.supplierName?.trim() ?? existing.supplierName,
        quantity: dto.quantity ?? existing.quantity,
        bagWeight:
          dto.storedAsWhole === true
            ? null
            : dto.bagWeight ?? existing.bagWeight,
        storedAsWhole: dto.storedAsWhole ?? existing.storedAsWhole,
        mfgDate: mfg,
        expDate: exp,
        status,
      },
    });

    await this.adjustStockOnEdit(
      existing.materialName,
      dto.materialName ?? existing.materialName,
      existing.quantity,
      dto.quantity ?? existing.quantity,
      dto.unit ?? existing.unit
    );

    const bagLogicChanged =
      (dto.quantity !== undefined && dto.quantity !== existing.quantity) ||
      (dto.bagWeight !== undefined && dto.bagWeight !== existing.bagWeight) ||
      (dto.storedAsWhole !== undefined &&
        dto.storedAsWhole !== existing.storedAsWhole);

    if (bagLogicChanged) {
      await this.prisma.inwardQrCode.deleteMany({ where: { inwardId: id } });
      const qrList = this.buildQrList(updated);
      if (qrList.length) {
        await this.prisma.inwardQrCode.createMany({
          data: qrList.map((qr) => ({ ...qr, inwardId: id })),
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const existing = await this.prisma.inwardEntry.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Inward entry not found');

    await this.prisma.inwardQrCode.deleteMany({ where: { inwardId: id } });
    await this.prisma.inwardEntry.delete({ where: { id } });

    await this.decrementStock(existing.materialName, existing.quantity);

    return { ok: true };
  }

  // ---------- STOCK MANAGEMENT HELPERS ----------

  async getStock() {
    return this.prisma.materialStock.findMany({
      orderBy: { materialName: 'asc' },
    });
  }

  private async incrementStock(
    materialName: string,
    unit: string,
    quantity: number
  ) {
    await this.prisma.materialStock.upsert({
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

  private async adjustStockOnEdit(
    oldMaterial: string,
    newMaterial: string,
    oldQty: number,
    newQty: number,
    unit: string
  ) {
    if (oldMaterial === newMaterial) {
      const diff = newQty - oldQty;
      if (diff !== 0) {
        await this.prisma.materialStock.update({
          where: { materialName: oldMaterial },
          data: { totalQuantity: { increment: diff } },
        });
      }
    } else {
      // subtract from old material
      await this.prisma.materialStock.update({
        where: { materialName: oldMaterial },
        data: { totalQuantity: { decrement: oldQty } },
      });

      // add to new material
      await this.incrementStock(newMaterial, unit, newQty);
    }
  }

  private async decrementStock(materialName: string, quantity: number) {
    await this.prisma.materialStock.update({
      where: { materialName },
      data: { totalQuantity: { decrement: quantity } },
    });
  }

  async getAnalytics() {
    const all = await this.prisma.inwardEntry.findMany();

    const totalMaterials = all.length;
    const active = all.filter((r) => r.status === 'Active').length;
    const expired = all.filter((r) => r.status === 'Expired').length;

    // Aggregate total quantity by supplier
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
    // Return array of strings
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
        state: 'CREATED', // only available (not issued or consumed)
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
