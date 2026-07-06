import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TscPrinterClient } from '../transport/tsc-printer.client';
import { PRINTERS } from '../config/printer.config';
import { PrinterLabelData } from '../types/printer-label-data';
import { generateTSPL, formatDate, getJulianDate } from '../tspl/inward.template';

@Injectable()
export class InwardPrinterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tscPrinterClient: TscPrinterClient
  ) {}

  async printLabel(qrId: string): Promise<void> {
    const labelData = await this.getLabelData(qrId);
    const tspl = generateTSPL(labelData);

    const printer = PRINTERS.inward;

    await this.tscPrinterClient.send(printer.ip, printer.port, tspl);
  }

  async printBatch(qrCodes: Array<{ qrId: string }>): Promise<void> {
    for (const qr of qrCodes) {
      await this.printLabel(qr.qrId);
      // Small delay between prints
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  private async getLabelData(qrId: string): Promise<PrinterLabelData> {
    const qr = await this.prisma.inwardQrCode.findUnique({
      where: { qrId },
      select: {
        qrId: true,
        inward: {
          select: {
            materialName: true,
            supplierName: true,
            batchNumber: true,
            quantity: true,
            unit: true,
            mfgDate: true,
            expDate: true,
          },
        },
      },
    });

    if (!qr?.inward) {
      throw new Error(`No inward record found for QR ${qrId}`);
    }

    return {
      qrId,
      materialName: qr.inward.materialName,
      supplierName: qr.inward.supplierName,
      batchNumber: qr.inward.batchNumber,
      quantity: qr.inward.quantity,
      unit: qr.inward.unit,
      mfgDate: formatDate(qr.inward.mfgDate),
      expDate: formatDate(qr.inward.expDate),
      julianDate: getJulianDate(new Date()),
    };
  }
}
