import { Injectable, NotFoundException } from '@nestjs/common';
import { ExecutionStatus, BatchExecutionStatus } from '@prisma/client';
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
            isActive: i === 1,
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
}
