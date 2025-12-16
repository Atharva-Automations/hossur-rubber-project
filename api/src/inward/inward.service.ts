import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInwardDto } from './dto/create-inward.dto';
import { UpdateInwardDto } from './dto/update-inward.dto';
import { QrState, Prisma } from '@prisma/client';
import { normalizeName, canonicalName } from '../common/utils/normalize';

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

  // ✅ FIX: Case-insensitive safe increment/upsert (prevents duplicate MaterialStock rows)
  private async incrementStock(
    materialName: string,
    unit: string,
    quantity: number,
    tx: PrismaTransactionClient | Prisma.TransactionClient = this.prisma
  ) {
    const existing = await tx.materialStock.findFirst({
      where: {
        materialName: {
          equals: materialName,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      await tx.materialStock.update({
        where: { id: existing.id },
        data: {
          totalQuantity: { increment: quantity },
          updatedAt: new Date(),
        },
      });
      return;
    }

    await tx.materialStock.create({
      data: {
        materialName,
        totalQuantity: quantity,
        unit,
      },
    });
  }

  // ✅ FIX: Case-insensitive safe decrement (findFirst + update by id)
  private async decrementStock(
    materialName: string,
    quantity: number,
    tx: PrismaTransactionClient | Prisma.TransactionClient = this.prisma
  ) {
    const stock = await tx.materialStock.findFirst({
      where: {
        materialName: {
          equals: materialName,
          mode: 'insensitive',
        },
      },
    });
    if (!stock) return;

    await tx.materialStock.update({
      where: { id: stock.id },
      data: { totalQuantity: { decrement: quantity }, updatedAt: new Date() },
    });
  }

  // ✅ FIX: normalize comparison so casing/spacing changes don’t break stock integrity
  private async adjustStockOnEdit(
    oldMaterial: string,
    newMaterial: string,
    oldQty: number,
    newQty: number,
    unit: string,
    tx: PrismaTransactionClient | Prisma.TransactionClient
  ) {
    const oldKey = normalizeName(oldMaterial);
    const newKey = normalizeName(newMaterial);

    const oldCanonical = canonicalName(oldKey);
    const newCanonical = canonicalName(newKey);

    if (oldKey === newKey) {
      const diff = newQty - oldQty;
      if (diff !== 0) {
        // ensure record exists (case-insensitive)
        const s = await tx.materialStock.findFirst({
          where: {
            materialName: {
              equals: oldCanonical,
              mode: 'insensitive',
            },
          },
        });

        if (s) {
          await tx.materialStock.update({
            where: { id: s.id },
            data: { totalQuantity: { increment: diff }, updatedAt: new Date() },
          });
        } else {
          await tx.materialStock.create({
            data: {
              materialName: oldCanonical,
              totalQuantity: diff > 0 ? diff : 0,
              unit,
            },
          });
        }
      }
    } else {
      // decrement old (case-insensitive)
      const oldStock = await tx.materialStock.findFirst({
        where: {
          materialName: {
            equals: oldCanonical,
            mode: 'insensitive',
          },
        },
      });

      if (oldStock) {
        await tx.materialStock.update({
          where: { id: oldStock.id },
          data: { totalQuantity: { decrement: oldQty }, updatedAt: new Date() },
        });
      }

      // increment/create new (canonical)
      await this.incrementStock(newCanonical, unit, newQty, tx);
    }
  }

  async create(dto: CreateInwardDto) {
    // ✅ FIX: canonicalize material + supplier (trim + collapse spaces + case normalization)
    const materialName = canonicalName(normalizeName(dto.materialName));
    const supplierName = canonicalName(normalizeName(dto.supplierName));

    const expDate = new Date(dto.expDate);
    const storedAsWhole = dto.storedAsWhole ?? false;
    const bagWeight = storedAsWhole ? null : dto.bagWeight ?? null;

    // ✅ Safety: if not storedAsWhole then bagWeight must be > 0 (service-level guard)
    if (!storedAsWhole) {
      if (
        bagWeight === null ||
        typeof bagWeight !== 'number' ||
        bagWeight <= 0
      ) {
        throw new BadRequestException(
          'bagWeight is required and must be > 0 when storedAsWhole is false'
        );
      }
    }

    // ✅ Safety: expDate must be after mfgDate
    const mfgDate = new Date(dto.mfgDate);
    if (expDate.getTime() <= mfgDate.getTime()) {
      throw new BadRequestException('Expiry must be after manufacturing date');
    }

    const newInward = await this.prisma.$transaction(async (tx) => {
      // 1. Create Inward Entry
      const inward = await tx.inwardEntry.create({
        data: {
          materialName,
          supplierName,
          quantity: dto.quantity,
          unit: dto.unit,
          bagWeight: bagWeight,
          storedAsWhole: storedAsWhole,
          mfgDate: mfgDate,
          expDate: expDate,
          status: this.computeStatus(expDate),
        },
      });

      // 2. Update Stock (case-insensitive safe)
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

    // ✅ Safety: expDate must be after mfgDate
    if (exp.getTime() <= mfg.getTime()) {
      throw new BadRequestException('Expiry must be after manufacturing date');
    }

    const status = this.computeStatus(exp);

    const newStoredAsWhole = dto.storedAsWhole ?? existing.storedAsWhole;

    const newBagWeight =
      newStoredAsWhole === true ? null : dto.bagWeight ?? existing.bagWeight;

    // ✅ Safety: if not storedAsWhole then bagWeight must be > 0
    if (!newStoredAsWhole) {
      if (
        newBagWeight === null ||
        typeof newBagWeight !== 'number' ||
        newBagWeight <= 0
      ) {
        throw new BadRequestException(
          'bagWeight is required and must be > 0 when storedAsWhole is false'
        );
      }
    }

    const bagLogicChanged =
      (dto.quantity !== undefined && dto.quantity !== existing.quantity) ||
      (dto.bagWeight !== undefined && dto.bagWeight !== existing.bagWeight) ||
      (dto.storedAsWhole !== undefined &&
        dto.storedAsWhole !== existing.storedAsWhole);

    // ✅ FIX: normalize/canonicalize names if provided
    const nextMaterialName = dto.materialName
      ? canonicalName(normalizeName(dto.materialName))
      : existing.materialName;

    const nextSupplierName = dto.supplierName
      ? canonicalName(normalizeName(dto.supplierName))
      : existing.supplierName;

    // ✅ CRITICAL: prevent QR regeneration if any QR already moved beyond CREATED
    const hasNonCreatedQr = existing.qrCodes.some(
      (qr) => qr.state !== QrState.CREATED
    );
    if (bagLogicChanged && hasNonCreatedQr) {
      throw new BadRequestException(
        'Cannot change bag structure after QR has been issued or consumed'
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Update Inward Entry
      const updatedEntry = await tx.inwardEntry.update({
        where: { id },
        data: {
          materialName: nextMaterialName,
          supplierName: nextSupplierName,
          quantity: dto.quantity ?? existing.quantity,
          unit: dto.unit ?? existing.unit,
          bagWeight: newBagWeight,
          storedAsWhole: newStoredAsWhole,
          mfgDate: mfg,
          expDate: exp,
          status,
        },
      });

      // 2. Adjust Stock (now normalization-safe)
      await this.adjustStockOnEdit(
        existing.materialName,
        nextMaterialName,
        existing.quantity,
        dto.quantity ?? existing.quantity,
        dto.unit ?? existing.unit,
        tx
      );

      // 3. Re-generate QR codes only if safe and needed
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
      // 3. Decrement Stock (case-insensitive safe)
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
    // ✅ Normalize & canonicalize incoming material parameter
    const materialName = canonicalName(normalizeName(material));

    return this.prisma.inwardQrCode.findMany({
      where: {
        inward: {
          materialName: {
            equals: materialName,
            mode: 'insensitive',
          },
        },
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
