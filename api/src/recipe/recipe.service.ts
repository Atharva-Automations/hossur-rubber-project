import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';

@Injectable()
export class RecipeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRecipeDto) {
    const existing = await this.prisma.recipe.findUnique({
      where: { recipeCode: dto.recipeCode },
    });
    if (existing) {
      throw new BadRequestException(`Recipe ${dto.recipeCode} already exists.`);
    }

    // --- 1. Batch Ingredient Validation and Mapping ---

    // Collect all unique ingredient codes from all steps
    const allIngredientCodes = dto.steps.flatMap((s) =>
      s.ingredients.map((i) => i.ingredientCode)
    );
    const uniqueCodes = [...new Set(allIngredientCodes)];

    // Fetch all ingredients in one batched query (highly efficient)
    const foundIngredients = await this.prisma.ingredient.findMany({
      where: { ingredientCode: { in: uniqueCodes } },
      select: { id: true, ingredientCode: true },
    });

    // Create a map for quick ID lookup: { "CODE_A": 1, "CODE_B": 2, ... }
    const ingredientMap = new Map(
      foundIngredients.map((ing) => [ing.ingredientCode, ing.id])
    );

    // Check for missing ingredients
    const missingCodes = uniqueCodes.filter((code) => !ingredientMap.has(code));
    if (missingCodes.length > 0) {
      throw new BadRequestException(
        `The following ingredients were not found: ${missingCodes.join(', ')}`
      );
    }

    // --- 2. Construct the Nested Create Data ---

    // Now we can synchronously construct the data for Prisma's nested create
    const stepsCreateData = dto.steps.map((s) => ({
      stepType: s.stepType,
      sequenceNumber: s.sequenceNumber,
      timerSeconds: s.timerSeconds,
      pressure: s.pressure,
      temperature: s.temperature,
      rpm: s.rpm,
      ingredients: {
        create: s.ingredients.map((i) => ({
          // We use the pre-fetched ID from the map
          ingredientId: ingredientMap.get(i.ingredientCode) as number,
          quantity: i.quantity,
          tolerance: i.tolerance,
          unit: i.unit,
        })),
      },
    }));

    // --- 3. Create the Recipe (Single atomic operation) ---
    return this.prisma.recipe.create({
      data: {
        recipeCode: dto.recipeCode,
        name: dto.name,
        description: dto.description,
        steps: {
          create: stepsCreateData,
        },
      },
      include: {
        steps: {
          include: {
            ingredients: { include: { ingredient: true } },
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.recipe.findMany({
      include: {
        steps: {
          include: {
            ingredients: { include: { ingredient: true } },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.recipe.findUnique({
      where: { id },
      include: {
        steps: {
          include: {
            ingredients: { include: { ingredient: true } },
          },
        },
      },
    });
  }

  async delete(id: number) {
    return this.prisma.recipe.delete({ where: { id } });
  }
}
