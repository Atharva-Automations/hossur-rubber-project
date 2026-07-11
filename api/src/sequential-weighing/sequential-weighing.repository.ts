import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ExecutionMode,
  ExecutionStatus,
  BatchExecutionStatus,
  IngredientExecutionStatus,
} from '@prisma/client';

@Injectable()
export class SequentialWeighingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRecipe(recipeCode: string) {
    return this.prisma.recipe.findFirst({
      where: {
        recipeCode,
        isActive: true,
      },
    });
  }

  async getRecipeSteps(recipeId: number) {
    return this.prisma.recipeStep.findMany({
      where: {
        recipeId,
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: {
        sequenceNumber: 'asc',
      },
    });
  }
}
