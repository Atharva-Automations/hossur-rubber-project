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
        include: {
          ingredient: {
            include: {
              bins: {
                take: 1,
              },
            },
          },

          executionBatch: {
            include: {
              execution: {
                include: {
                  recipe: true,
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

      recipeCode: executionIngredient.executionBatch.execution.recipe.recipeCode,

      executionCode: executionIngredient.executionBatch.execution.executionCode,

      batchNumber: executionIngredient.executionBatch.batchNumber,

      ingredientCode: executionIngredient.ingredient.ingredientCode,

      binNumber: executionIngredient.ingredient.bins[0]?.binNumber ?? '-',

      quantity: executionIngredient.quantity,

      // unit: executionIngredient.ingredient.unit,

      tolerance: executionIngredient.tolerance,

      julianDate: this.getJulianDate(new Date()),

      mode: executionIngredient.executionBatch.execution.mode,
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

  private getJulianDate(date: Date): string {
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    return `${String(date.getUTCFullYear()).slice(-2)}${String(
      dayOfYear
    ).padStart(3, '0')}`;
  }
}
