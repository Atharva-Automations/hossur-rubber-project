import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BinsService {
  constructor(private prisma: PrismaService) {}

  async assignBin(data: any) {
    const { ingredientId, binNumber, minQuantity, maxQuantity } = data;

    if (!ingredientId || !binNumber) {
      throw new BadRequestException('Ingredient and Bin Number are required');
    }

    const ingredientExists = await this.prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });
    if (!ingredientExists)
      throw new BadRequestException('Ingredient not found');

    const binExists = await this.prisma.binAssignment.findUnique({
      where: { binNumber },
    });
    if (binExists)
      throw new BadRequestException('This bin number is already assigned');

    return this.prisma.binAssignment.create({
      data: {
        ingredientId,
        binNumber,
        minQuantity,
        maxQuantity,
      },
    });
  }

  async findAll() {
    return this.prisma.binAssignment.findMany({
      include: { ingredient: true },
      orderBy: { binNumber: 'asc' },
    });
  }

  async delete(id: number) {
    return this.prisma.binAssignment.delete({ where: { id } });
  }
}
