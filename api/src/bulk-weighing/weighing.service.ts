import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IngredientExecutionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ScanQrDto } from './dto/scan-qr.dto';
import { CompleteWeighingDto } from './dto/complete-weighing.dto';
import { buildPlcPayload } from './utils/plc-payload.builder';

@Injectable()
export class WeighingService {
  constructor(private readonly prisma: PrismaService) {}

  async scan(dto: ScanQrDto) {
    console.log('QR Received:', JSON.stringify(dto.qrId));
    return this.prisma.$transaction(async (tx) => {
      const executionIngredient = await tx.executionIngredient.findUnique({
        where: {
          qrId: dto.qrId,
        },
        include: {
          ingredient: {
            include: {
              bins: true,
            },
          },
          recipeStep: true,
          executionBatch: {
            include: {
              execution: {
                include: {
                  recipe: true,
                },
              },

              ingredients: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
      });
      console.log(executionIngredient);

      if (!executionIngredient) {
        throw new NotFoundException('Invalid QR Code.');
      }

      // Reject if ingredient already completed
      if (executionIngredient.status === IngredientExecutionStatus.COMPLETED) {
        throw new BadRequestException('Ingredient already completed.');
      }

      const batch = executionIngredient.executionBatch;

      // Only active batch can be scanned
      if (!batch.isActive) {
        throw new BadRequestException(
          'Complete the current batch before scanning another batch.'
        );
      }

      // Check whether this is the first scan of this batch
      const scannedCount = await tx.executionIngredient.count({
        where: {
          executionBatchId: batch.id,
          scannedAt: {
            not: null,
          },
        },
      });

      const isFirstScanOfBatch = scannedCount === 0;

      const plcPayload = buildPlcPayload(
        executionIngredient,
        isFirstScanOfBatch
      );

      // Mark ingredient as scanned
      await tx.executionIngredient.update({
        where: {
          id: executionIngredient.id,
        },
        data: {
          status: IngredientExecutionStatus.SCANNED,
          scannedAt: new Date(),
        },
      });

      return {
        success: true,
        payload: plcPayload,
      };
    });
  }

  async complete(dto: CompleteWeighingDto) {
    return this.prisma.$transaction(async (tx) => {
      const executionIngredient = await tx.executionIngredient.findUnique({
        where: {
          qrId: dto.qrId,
        },
        include: {
          executionBatch: true,
        },
      });

      if (!executionIngredient) {
        throw new NotFoundException('Invalid QR Code.');
      }

      if (executionIngredient.status === IngredientExecutionStatus.COMPLETED) {
        throw new BadRequestException('Ingredient already completed.');
      }

      await tx.executionIngredient.update({
        where: {
          id: executionIngredient.id,
        },
        data: {
          actualQuantity: dto.weight,
          completedAt: new Date(),
          status: IngredientExecutionStatus.COMPLETED,
        },
      });

      const pendingIngredients = await tx.executionIngredient.count({
        where: {
          executionBatchId: executionIngredient.executionBatchId,
          status: {
            not: IngredientExecutionStatus.COMPLETED,
          },
        },
      });

      const batchCompleted = pendingIngredients === 0;

      if (batchCompleted) {
        await tx.executionBatch.update({
          where: {
            id: executionIngredient.executionBatchId,
          },
          data: {
            isActive: false,
            completedAt: new Date(),
          },
        });
      }

      return {
        success: true,
        batchCompleted,
      };
    });
  }

  async findAllExecutions() {
    const executions = await this.prisma.execution.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        recipe: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return executions.map((execution) => ({
      id: execution.id,
      executionCode: execution.executionCode,
      recipeId: execution.recipeId,
      recipeName: execution.recipe.name,
      totalBatches: execution.totalBatches,
      status: execution.status,
      createdAt: execution.createdAt,
    }));
  }
}
