import { Injectable } from '@nestjs/common';
import { WeighingLabelData } from '../types/printer-label-data';
import { PrismaService } from '../../prisma/prisma.service';
import { TscPrinterClient } from '../transport/tsc-printer.client';
import { PRINTERS } from '../config/printer.config';
import { generateWeighingTSPL } from '../tspl/weighing.template';

@Injectable()
export class WeighingPrinterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tscPrinterClient: TscPrinterClient
  ) {}

  private async getLabelData(qrId: string): Promise<WeighingLabelData> {
    const executionIngredient =
      await this.prisma.executionIngredient.findUnique({
        where: {
          qrId,
        },
        select: {
          qrId: true,
          quantity: true,
          tolerance: true,

          ingredient: {
            select: {
              ingredientCode: true,
            },
          },

          executionBatch: {
            select: {
              batchNumber: true,

              execution: {
                select: {
                  executionCode: true,
                },
              },
            },
          },
        },
      });

    if (!executionIngredient) {
      throw new Error(`QR ${qrId} not found.`);
    }

    return {
      qrId: executionIngredient.qrId,

      executionCode: executionIngredient.executionBatch.execution.executionCode,

      batchNumber: executionIngredient.executionBatch.batchNumber,

      ingredientCode: executionIngredient.ingredient.ingredientCode,

      quantity: executionIngredient.quantity,

      tolerance: executionIngredient.tolerance,
    };
  }

  async printLabel(qrId: string): Promise<void> {
    const labelData = await this.getLabelData(qrId);

    const tspl = generateWeighingTSPL(labelData);

    const printer = PRINTERS.weighing;

    await this.tscPrinterClient.send(printer.ip, printer.port, tspl);
  }

  async printBatch(qrCodes: Array<{ qrId: string }>): Promise<void> {
    for (const qr of qrCodes) {
      await this.printLabel(qr.qrId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
