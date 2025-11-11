import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';

@Injectable()
export class RecipeService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRecipeDto) {
    const existing = await this.prisma.recipe.findUnique({
      where: { recipeCode: dto.recipeCode },
    });
    if (existing)
      throw new BadRequestException(`Recipe ${dto.recipeCode} already exists.`);

    return this.prisma.recipe.create({
      data: {
        recipeCode: dto.recipeCode,
        name: dto.name,
        description: dto.description,
        steps: {
          create: await Promise.all(
            dto.steps.map(async (s) => ({
              stepType: s.stepType,
              sequenceNumber: s.sequenceNumber,
              timerSeconds: s.timerSeconds,
              pressure: s.pressure,
              temperature: s.temperature,
              rpm: s.rpm,
              ingredients: {
                create: await Promise.all(
                  s.ingredients.map(async (i) => {
                    const ing = await this.prisma.ingredient.findUnique({
                      where: { ingredientCode: i.ingredientCode },
                    });
                    if (!ing)
                      throw new BadRequestException(
                        `Ingredient ${i.ingredientCode} not found.`
                      );

                    return {
                      ingredientId: ing.id,
                      quantity: i.quantity,
                      unit: i.unit,
                    };
                  })
                ),
              },
            }))
          ),
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
