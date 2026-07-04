import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignBinDto } from './dto/assign-bin.dto';

@Injectable()
export class BinService {
  constructor(private readonly prisma: PrismaService) {}

  async assignBin(dto: AssignBinDto) {
    const { binNumber, ingredientId, minQuantity, maxQuantity } = dto;

    // 1. Validate Quantities
    if (minQuantity <= 0)
      throw new BadRequestException('Minimum quantity must be greater than 0');
    if (maxQuantity <= minQuantity)
      throw new BadRequestException(
        'Maximum quantity must be greater than minimum quantity'
      );

    // 2. Check for duplicate bin number
    const existingBinByNumber = await this.prisma.binAssignment.findUnique({
      where: { binNumber },
    });
    if (existingBinByNumber)
      throw new BadRequestException(`Bin ${binNumber} is already assigned.`);

    // 3. Check if ingredient already assigned
    const existingBinByIngredient = await this.prisma.binAssignment.findUnique({
      where: { ingredientId },
    });
    if (existingBinByIngredient)
      throw new BadRequestException(
        'This ingredient already has a bin assigned.'
      );

    // 4. Create new assignment
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

  async findAll() {
    return this.prisma.binAssignment.findMany({
      include: {
        ingredient: true,
      },
      orderBy: { binNumber: 'asc' },
    });
  }

  async update(
    id: number,
    data: Partial<AssignBinDto> & { currentQuantity?: number }
  ) {
    const { binNumber, ingredientId, minQuantity, maxQuantity } = data;

    const existing = await this.prisma.binAssignment.findUnique({
      where: { id },
    });
    if (!existing) throw new BadRequestException('Bin assignment not found.');

    const newBinNumber = binNumber ?? existing.binNumber;
    const newIngredientId = ingredientId ?? existing.ingredientId;
    const newMinQuantity = minQuantity ?? existing.minQuantity;
    const newMaxQuantity = maxQuantity ?? existing.maxQuantity;

    // 1. Validate Quantities
    if (newMinQuantity <= 0)
      throw new BadRequestException('Minimum quantity must be greater than 0');
    if (newMaxQuantity <= newMinQuantity)
      throw new BadRequestException(
        'Maximum quantity must be greater than minimum quantity'
      );
    // Also check if current quantity exceeds new max
    if ((data.currentQuantity ?? existing.currentQuantity) > newMaxQuantity) {
      throw new BadRequestException(
        'Current quantity exceeds the new maximum capacity.'
      );
    }

    // 2. Check for duplicate bin number (only if binNumber is changing)
    if (newBinNumber !== existing.binNumber) {
      const binConflict = await this.prisma.binAssignment.findUnique({
        where: { binNumber: newBinNumber },
      });
      if (binConflict) {
        throw new BadRequestException(
          `Bin number ${newBinNumber} is already assigned to a different ingredient.`
        );
      }
    }

    // 3. Check if ingredient already assigned (only if ingredient is changing)
    if (newIngredientId !== existing.ingredientId) {
      const ingredientConflict = await this.prisma.binAssignment.findUnique({
        where: { ingredientId: newIngredientId },
      });
      // Ensure the conflict is not with the current record being updated
      if (ingredientConflict && ingredientConflict.id !== id) {
        throw new BadRequestException(
          'This ingredient is already assigned to another bin.'
        );
      }
    }

    return this.prisma.binAssignment.update({
      where: { id },
      data: {
        binNumber: newBinNumber,
        ingredientId: newIngredientId,
        minQuantity: newMinQuantity,
        maxQuantity: newMaxQuantity,
        currentQuantity: data.currentQuantity, // Allow updating current quantity
      },
      include: { ingredient: true },
    });
  }

  async delete(id: number) {
    const existing = await this.prisma.binAssignment.findUnique({
      where: { id },
    });
    // Use NotFoundException if this is exposed via a controller, but BadRequest is fine too
    if (!existing) throw new BadRequestException('Bin assignment not found');

    // Add check to prevent deletion if currentQuantity > 0 (optional, but good practice)
    if (existing.currentQuantity > 0) {
      throw new BadRequestException(
        'Cannot delete bin assignment with material currently stored.'
      );
    }

    await this.prisma.binAssignment.delete({ where: { id } });
    return { message: 'Bin assignment deleted successfully' };
  }

  // --- Utility Methods ---

  async getAvailableBins() {
    // assuming fixed 31 bins labeled "B1" to "B31"
    const allBins = Array.from({ length: 31 }, (_, i) => `B${i + 1}`);
    const assigned = await this.prisma.binAssignment.findMany({
      select: { binNumber: true },
    });
    const assignedSet = new Set(assigned.map((b) => b.binNumber));
    return allBins.filter((b) => !assignedSet.has(b));
  }

  async getUnassignedIngredients() {
    const all = await this.prisma.ingredient.findMany({
      select: {
        id: true,
        ingredientCode: true,
        name: true,
        materialName: true,
      },
    });
    const assigned = await this.prisma.binAssignment.findMany({
      select: { ingredientId: true },
    });
    const assignedSet = new Set(assigned.map((b) => b.ingredientId));

    return all.filter((ing) => !assignedSet.has(ing.id));
  }

  async getBinStatus() {
    const allBins = Array.from({ length: 31 }, (_, i) => `B${i + 1}`);

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
