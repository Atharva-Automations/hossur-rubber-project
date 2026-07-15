import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQcSpecificationDto } from './dto/create-qc-specification.dto';
import { UpdateQcSpecificationDto } from './dto/update-qc-specification.dto';
import { ScanQcDto } from './dto/scan-qc.dto';
import { CreateQcInspectionDto } from './dto/create-qc-inspection.dto';
import { QcStatus } from '@prisma/client';

@Injectable()
export class QcService {
  constructor(private readonly prisma: PrismaService) {}

  async createSpecification(dto: CreateQcSpecificationDto) {
    // Check recipe exists
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id: dto.recipeId,
      },
    });

    if (!recipe) {
      throw new BadRequestException('Recipe not found.');
    }

    // Prevent duplicate specification
    const existing = await this.prisma.qcSpecification.findUnique({
      where: {
        recipeId: dto.recipeId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'QC Specification already exists for this recipe.'
      );
    }

    const specification = await this.prisma.qcSpecification.create({
      data: dto,
      include: {
        recipe: true,
      },
    });

    return {
      message: 'QC Specification created successfully.',
      specification,
    };
  }

  async findAllSpecifications() {
    return this.prisma.qcSpecification.findMany({
      include: {
        recipe: true,
      },
      orderBy: {
        recipeId: 'asc',
      },
    });
  }

  async findSpecification(id: number) {
    const specification = await this.prisma.qcSpecification.findUnique({
      where: {
        id,
      },
      include: {
        recipe: true,
      },
    });

    if (!specification) {
      throw new BadRequestException('QC Specification not found.');
    }

    return specification;
  }

  async updateSpecification(id: number, dto: UpdateQcSpecificationDto) {
    const existing = await this.prisma.qcSpecification.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new BadRequestException('QC Specification not found.');
    }

    // If recipe is changed, ensure uniqueness
    if (dto.recipeId && dto.recipeId !== existing.recipeId) {
      const recipeExists = await this.prisma.recipe.findUnique({
        where: {
          id: dto.recipeId,
        },
      });

      if (!recipeExists) {
        throw new BadRequestException('Recipe not found.');
      }

      const duplicate = await this.prisma.qcSpecification.findUnique({
        where: {
          recipeId: dto.recipeId,
        },
      });

      if (duplicate) {
        throw new BadRequestException(
          'QC Specification already exists for this recipe.'
        );
      }
    }

    const specification = await this.prisma.qcSpecification.update({
      where: {
        id,
      },
      data: dto,
      include: {
        recipe: true,
      },
    });

    return {
      message: 'QC Specification updated successfully.',
      specification,
    };
  }

  async deleteSpecification(id: number) {
    const existing = await this.prisma.qcSpecification.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new BadRequestException('QC Specification not found.');
    }

    await this.prisma.qcSpecification.delete({
      where: {
        id,
      },
    });

    return {
      message: 'QC Specification deleted successfully.',
    };
  }

  async scanQr(dto: ScanQcDto) {
    const finalBatch = await this.prisma.finalBatch.findUnique({
      where: {
        qrId: dto.qrId,
      },
      include: {
        recipe: true,
        executionBatch: {
          include: {
            execution: true,
          },
        },
      },
    });

    if (!finalBatch) {
      throw new BadRequestException('Final Batch not found.');
    }

    const specification = await this.prisma.qcSpecification.findUnique({
      where: {
        recipeId: finalBatch.recipeId,
      },
    });

    if (!specification) {
      throw new BadRequestException(
        'QC Specification not found for this recipe.'
      );
    }

    return {
      finalBatchId: finalBatch.id,
      qrId: finalBatch.qrId,

      recipe: finalBatch.recipe,

      batch: finalBatch.executionBatch,

      specification,
    };
  }

  async createInspection(dto: CreateQcInspectionDto) {
    const finalBatch = await this.prisma.finalBatch.findUnique({
      where: {
        id: dto.finalBatchId,
      },
    });

    if (!finalBatch) {
      throw new BadRequestException('Final Batch not found.');
    }

    const specification = await this.prisma.qcSpecification.findUnique({
      where: {
        recipeId: finalBatch.recipeId,
      },
    });

    if (!specification) {
      throw new BadRequestException('QC Specification not found.');
    }

    const passed =
      specification.hardness === dto.hardnessActual &&
      specification.tensile === dto.tensileActual &&
      specification.elongation === dto.elongationActual &&
      specification.specificGravity === dto.specificGravityActual &&
      specification.compressionSet === dto.compressionSetActual;

    const inspection = await this.prisma.qcInspection.create({
      data: {
        finalBatchId: dto.finalBatchId,

        qcSpecificationId: specification.id,

        hardnessActual: dto.hardnessActual,
        tensileActual: dto.tensileActual,
        elongationActual: dto.elongationActual,
        specificGravityActual: dto.specificGravityActual,
        compressionSetActual: dto.compressionSetActual,

        remarks: dto.remarks,

        status: passed ? QcStatus.PASS : QcStatus.FAIL,
      },

      include: {
        finalBatch: {
          include: {
            recipe: true,
            executionBatch: {
              include: {
                execution: true,
              },
            },
          },
        },
        qcSpecification: true,
      },
    });

    return {
      message: `QC ${passed ? 'PASSED' : 'FAILED'} Successfully.`,
      inspection,
    };
  }

  async findAllInspections() {
    return this.prisma.qcInspection.findMany({
      include: {
        finalBatch: {
          include: {
            recipe: true,
            executionBatch: {
              include: {
                execution: true,
              },
            },
          },
        },
      },
      orderBy: {
        testedAt: 'desc',
      },
    });
  }
}
