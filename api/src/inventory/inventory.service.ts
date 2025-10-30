// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { TxnType } from '@prisma/client';
// import { customAlphabet } from 'nanoid';

// @Injectable()
// export class InventoryService {
//   constructor(private prisma: PrismaService) {}

//   // Create new inward lot
//   async inward(data: {
//     rawMaterialId: number;
//     supplier?: string;
//     qtyReceived: number;
//     expiryDate?: string;
//     binId?: number;
//   }) {
//     const qrCode = `LOT-${customAlphabet('1234567890ABCDEFG', 8)()}`;

//     const lot = await this.prisma.rawLot.create({
//       data: {
//         rawMaterialId: data.rawMaterialId,
//         supplier: data.supplier,
//         qtyReceived: data.qtyReceived,
//         qtyOnHand: data.qtyReceived,
//         expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
//         qrCode,
//         binId: data.binId,
//         txns: {
//           create: {
//             txnType: TxnType.INWARD,
//             qty: data.qtyReceived,
//           },
//         },
//       },
//       include: { rawMaterial: true, bin: true },
//     });

//     return lot;
//   }

//   // Outward / issue stock
//   async outward(data: { lotId: number; qty: number; ref?: string }) {
//     const lot = await this.prisma.rawLot.findUnique({ where: { id: data.lotId } });
//     if (!lot) throw new Error('Lot not found');
//     if (lot.qtyOnHand < data.qty) throw new Error('Insufficient stock');

//     const updated = await this.prisma.rawLot.update({
//       where: { id: data.lotId },
//       data: {
//         qtyOnHand: { decrement: data.qty },
//         txns: {
//           create: {
//             txnType: TxnType.OUTWARD,
//             qty: data.qty,
//             ref: data.ref,
//           },
//         },
//       },
//       include: { txns: true },
//     });

//     return updated;
//   }

//   // List all lots
//   async getLots() {
//     return this.prisma.rawLot.findMany({
//       include: { rawMaterial: true, bin: true },
//       orderBy: { id: 'desc' },
//     });
//   }

//   // Show ledger for a lot
//   async getLedger(lotId: number) {
//     return this.prisma.inventoryTxn.findMany({
//       where: { lotId },
//       orderBy: { at: 'asc' },
//     });
//   }
// }
