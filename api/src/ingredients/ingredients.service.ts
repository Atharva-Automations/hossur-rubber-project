import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';

@Injectable()
export class IngredientService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateIngredientDto) {
    const { ingredientCode, materialName, type } = data;

    // Prevent duplicate material assignment
    const existing = await this.prisma.ingredient.findFirst({
      where: { materialName },
    });
    if (existing) {
      throw new BadRequestException(
        `Material "${materialName}" is already assigned to an ingredient.`
      );
    }

    return this.prisma.ingredient.create({ data });
  }

  async findAll() {
    return this.prisma.ingredient.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        bins: {
          select: {
            id: true,
            binNumber: true,
            minQuantity: true,
            maxQuantity: true,
            currentQuantity: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.ingredient.findUnique({ where: { id } });
  }

  async delete(id: number) {
    return this.prisma.ingredient.delete({ where: { id } });
  }
}
