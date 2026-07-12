import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ExecutionStatus,
  BatchExecutionStatus,
  BatchProcessStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExecutionDto } from './dto/create-execution.dto';
import { generateExecutionCode } from '../common/utils/code-generator';
import { buildExecutionIngredients } from './utils/execution-builder';

@Injectable()
export class ExecutionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExecutionDto) {
    return this.prisma.$transaction(async (tx) => {
      // Check Recipe Exists
      const recipe = await tx.recipe.findUnique({
        where: {
          id: dto.recipeId,
        },
        include: {
          steps: {
            include: {
              ingredients: {
                include: {
                  ingredient: {
                    include: {
                      bins: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!recipe) {
        throw new NotFoundException('Recipe not found.');
      }

      // Generate Execution Code
      const count = await tx.execution.count();

      const executionCode = generateExecutionCode(count + 1);

      // Create Execution
      const execution = await tx.execution.create({
        data: {
          recipeId: dto.recipeId,
          executionCode,
          mode: dto.mode,
          totalBatches: dto.totalBatches,
          status: ExecutionStatus.PENDING,
        },
      });

      const batches = [];

      for (let i = 1; i <= dto.totalBatches; i++) {
        const batch = await tx.executionBatch.create({
          data: {
            executionId: execution.id,
            batchNumber: i,
            status: BatchExecutionStatus.PENDING,
            kneaderStatus: BatchProcessStatus.PENDING,
            mixingStatus: BatchProcessStatus.PENDING,
          },
        });

        await tx.kneaderExecution.create({
          data: {
            executionBatchId: batch.id,
          },
        });

        batches.push(batch);
      }

      const executionIngredients = buildExecutionIngredients(
        recipe,
        execution,
        batches
      );

      await tx.executionIngredient.createMany({
        data: executionIngredients,
      });

      return {
        message: 'Execution created successfully.',

        execution: {
          id: execution.id,
          executionCode: execution.executionCode,
          recipeCode: recipe.recipeCode,
          recipeName: recipe.name,
          mode: execution.mode,
          totalBatches: execution.totalBatches,
          status: execution.status,
        },

        summary: {
          batchesCreated: batches.length,
          ingredientsCreated: executionIngredients.length,
        },
      };
    });
  }

  async findExecutionQrs(id: number) {
    const execution = await this.prisma.execution.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        executionCode: true,
        totalBatches: true,

        batches: {
          orderBy: {
            batchNumber: 'asc',
          },
          select: {
            id: true,
            batchNumber: true,

            ingredients: {
              orderBy: {
                plcIngredientIndex: 'asc',
              },
              select: {
                id: true,
                qrId: true,
                quantity: true,
                tolerance: true,

                ingredient: {
                  select: {
                    name: true,
                    ingredientCode: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!execution) {
      throw new NotFoundException('Execution not found.');
    }

    return {
      id: execution.id,
      executionCode: execution.executionCode,
      totalBatches: execution.totalBatches,

      batches: execution.batches.map((batch) => ({
        id: batch.id,
        batchNumber: batch.batchNumber,

        ingredients: batch.ingredients.map((ingredient) => ({
          id: ingredient.id,
          qrId: ingredient.qrId,
          quantity: ingredient.quantity,
          tolerance: ingredient.tolerance,
          ingredientCode: ingredient.ingredient.ingredientCode,
        })),
      })),
    };
  }
}
