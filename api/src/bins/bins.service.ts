import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignBinDto } from './dto/assign-bin.dto';

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

  async assignBin(dto: AssignBinDto) {
    const { binNumber, ingredientId, minQuantity, maxQuantity } = dto;

    // validate min/max
    if (minQuantity <= 0)
      throw new BadRequestException('Minimum quantity must be greater than 0');
    if (maxQuantity <= minQuantity)
      throw new BadRequestException(
        'Maximum quantity must be greater than minimum quantity'
      );

    // Check if bin already assigned
    const existingBin = await this.prisma.binAssignment.findUnique({
      where: { binNumber },
    });
    if (existingBin)
      throw new BadRequestException(`Bin ${binNumber} is already assigned.`);

    // Check if ingredient already assigned
    const existingIngredient = await this.prisma.binAssignment.findUnique({
      where: { ingredientId },
    });
    if (existingIngredient)
      throw new BadRequestException(
        'This ingredient already has a bin assigned.'
      );

    // Create new assignment
    const assignment = await this.prisma.binAssignment.create({
      data: {
        binNumber,
        ingredientId,
        minQuantity,
        maxQuantity,
        currentQuantity: 0,
      },
      include: { ingredient: true },
    });

    return {
      message: `Bin ${binNumber} assigned to ingredient ${
        assignment.ingredient.name || assignment.ingredient.ingredientCode
      }`,
      assignment,
    };
  }

  async getAllBins() {
    return this.prisma.binAssignment.findMany({
      include: { ingredient: true },
      orderBy: { binNumber: 'asc' },
    });
  }

  async getAvailableBins() {
    // assuming fixed 25 bins labeled "B1" to "B25"
    const allBins = Array.from({ length: 25 }, (_, i) => `B${i + 1}`);
    const assigned = await this.prisma.binAssignment.findMany({
      select: { binNumber: true },
    });
    const assignedSet = new Set(assigned.map((b) => b.binNumber));
    return allBins.filter((b) => !assignedSet.has(b));
  }

  // ✅ Delete assignment
  async deleteBin(id: number) {
    const existing = await this.prisma.binAssignment.findUnique({
      where: { id },
    });
    if (!existing) throw new BadRequestException('Bin assignment not found');

    await this.prisma.binAssignment.delete({ where: { id } });
    return { message: 'Bin assignment deleted successfully' };
  }

  async getUnassignedIngredients() {
    // All ingredients
    const all = await this.prisma.ingredient.findMany({
      select: {
        id: true,
        ingredientCode: true,
        name: true,
        materialName: true,
      },
    });

    // Ingredients that already have a bin
    const assigned = await this.prisma.binAssignment.findMany({
      select: { ingredientId: true },
    });
    const assignedSet = new Set(assigned.map((b) => b.ingredientId));

    // Return only unassigned ingredients
    return all.filter((ing) => !assignedSet.has(ing.id));
  }

  async getBinStatus() {
    const allBins = Array.from({ length: 25 }, (_, i) => `B${i + 1}`);

    const assigned = await this.prisma.binAssignment.findMany({
      include: { ingredient: true },
    });

    const assignedMap = new Map(assigned.map((b) => [b.binNumber, b]));

    return allBins.map((binNumber) => {
      const assignedBin = assignedMap.get(binNumber);
      if (!assignedBin) {
        return {
          binNumber,
          status: 'EMPTY',
          ingredient: null,
          currentQuantity: 0,
          minQuantity: 0,
          maxQuantity: 0,
          fillPercent: 0,
        };
      }
      const { ingredient, currentQuantity, minQuantity, maxQuantity } =
        assignedBin;
      const fillPercent = Math.min(
        100,
        Math.max(0, (currentQuantity / maxQuantity) * 100)
      );

      return {
        binNumber,
        status: 'ASSIGNED',
        ingredient,
        currentQuantity,
        minQuantity,
        maxQuantity,
        fillPercent,
      };
    });
  }
}
