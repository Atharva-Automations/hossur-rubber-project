import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BinService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { binNumber, ingredientId, minQuantity, maxQuantity } = data;

    // ✅ Check for duplicate bin number
    const existingBin = await this.prisma.binAssignment.findUnique({
      where: { binNumber },
    });
    if (existingBin) {
      throw new BadRequestException(`Bin number ${binNumber} already exists.`);
    }

    // ✅ Check if ingredient already has a bin (1:1 assignment)
    const assignedBin = await this.prisma.binAssignment.findFirst({
      where: { ingredientId },
    });
    if (assignedBin) {
      throw new BadRequestException(
        `This ingredient already has a bin assigned.`
      );
    }

    return this.prisma.binAssignment.create({
      data: {
        binNumber,
        ingredientId,
        minQuantity: minQuantity || 0,
        maxQuantity: maxQuantity || 0,
        currentQuantity: 0,
      },
      include: {
        ingredient: true,
      },
    });
  }

  async findAll() {
    return this.prisma.binAssignment.findMany({
      include: {
        ingredient: true,
      },
      orderBy: { binNumber: 'asc' },
    });
  }

  async delete(id: number) {
    return this.prisma.binAssignment.delete({ where: { id } });
  }

  async update(id: number, data: any) {
    return this.prisma.binAssignment.update({
      where: { id },
      data: {
        binNumber: data.binNumber,
        minQuantity: Number(data.minQuantity),
        maxQuantity: Number(data.maxQuantity),
        ingredientId: Number(data.ingredientId),
      },
    });
  }
}
