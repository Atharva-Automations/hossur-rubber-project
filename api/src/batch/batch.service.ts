/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import {
  StartStepDto,
  ScanExecutionDto,
  CompleteStepDto,
  FinalizeProductDto,
} from './dto/execution-step.dto';

type BatchWithWeighingRelations = Prisma.BatchGetPayload<{
  include: {
    steps: {
      include: {
        ingredients: {
          include: { ingredient: { include: { bins: true } } };
        };
      };
    };
    productExecutions: true;
  };
}>;

type BatchWithExecutions = Prisma.BatchGetPayload<{
  include: {
    productExecutions: true;
  };
}>;

type ProductWithSteps = Prisma.ProductExecutionGetPayload<{
  include: { stepExecutions: true };
}>;

@Injectable()
export class BatchService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrderedStepExecutionsForProduct(productExecutionId: number) {
    return this.prisma.stepExecution.findMany({
      where: { productExecutionId },
      include: { batchStep: true },
      orderBy: {
        batchStep: {
          sequenceNumber: 'asc',
        },
      } as any,
    });
  }

  // batch creation, updation and deletion helpers

  async findAll() {
    return this.prisma.batch.findMany({
      include: {
        recipe: true,
        steps: { include: { ingredients: { include: { ingredient: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        recipe: true,
        steps: {
          include: {
            ingredients: { include: { ingredient: true } },
            weighedBags: true,
            executionScans: true,
          },
        },
        weighedBags: true,
      },
    });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async create(dto: CreateBatchDto) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: dto.recipeId },
      include: {
        steps: { include: { ingredients: { include: { ingredient: true } } } },
      },
    });
    if (!recipe) throw new BadRequestException('Recipe not found');

    const recipeStepsFiltered = recipe.steps.filter(
      (s) =>
        (s.stepType === 'KNEADER' && dto.enableKneader) ||
        (s.stepType === 'MIXING' && dto.enableMixing)
    );
    if (recipeStepsFiltered.length === 0)
      throw new BadRequestException(
        'No steps selected (enableKneader/enableMixing).'
      );

    const batch = await this.prisma.$transaction(async (tx) => {
      const createdBatch = await tx.batch.create({
        data: {
          recipeId: dto.recipeId,
          quantity: dto.quantity,
          status: 'CREATED',
        },
      });

      for (const s of recipeStepsFiltered) {
        const bs = await tx.batchStep.create({
          data: {
            batchId: createdBatch.id,
            stepType: s.stepType,
            sequenceNumber: s.sequenceNumber,
            timerSeconds: s.timerSeconds,
            pressure: s.pressure,
            temperature: s.temperature,
            rpm: s.rpm,
            status: 'PENDING',
          },
        });

        for (const [index, ri] of s.ingredients.entries()) {
          const quantityPerUnit = Number(ri.quantity || 0);
          await tx.batchIngredient.create({
            data: {
              batchStepId: bs.id,
              ingredientId: ri.ingredientId,
              quantityPerUnit,
              totalQuantity: quantityPerUnit * dto.quantity,
              unit: ri.unit,
              sequenceInStep: index + 1,
            } as any,
          });
        }
      }
      return createdBatch;
    });
    return batch;
  }

  async delete(id: number) {
    await this.prisma.batch.delete({ where: { id } });
    return { ok: true };
  }

  // sequential weighing helpers

  async startExecution(batchId: number) {
    const existingExecutions = await (
      this.prisma as any
    ).productExecution.count({
      where: { batchId },
    });
    if (existingExecutions > 0) {
      // Already initialized
      return this.findOne(batchId);
    }

    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
      include: { steps: { include: { ingredients: true } } },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    if (batch.weighingStrategy === 'BULK') {
      throw new BadRequestException(
        'This batch is configured for BULK weighing. Use /batch/:id/bulk/start.'
      );
    }

    // Explicitly type the transaction client as any here because the generated
    // Prisma types for the interactive transaction client are currently
    // missing the `productExecution` delegate, even though it exists on
    // the main `PrismaClient`. At runtime this works correctly since the
    // delegate is generated from the Prisma schema.
    await this.prisma.$transaction(async (tx: any) => {
      for (let i = 1; i <= batch.quantity; i++) {
        const pe = await tx.productExecution.create({
          data: {
            batchId: batch.id,
            productSequence: i,
            status: 'CREATED',
          },
        });

        for (const step of batch.steps) {
          await tx.stepExecution.create({
            data: {
              productExecutionId: pe.id,
              batchStepId: step.id,
              status: 'PENDING',
              ingredientsExpected: step.ingredients.length,
            },
          });
        }
      }

      await tx.batch.update({
        where: { id: batch.id },
        data: { status: 'WEIGHING' },
      });
    });

    return this.findOne(batchId);
  }

  async getNextWeighingItem(batchId: number) {
    const batch = (await this.prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        steps: {
          orderBy: { sequenceNumber: 'asc' },
          include: {
            ingredients: {
              // Cast to any to avoid Prisma type mismatch on sequenceInStep
              orderBy: { sequenceInStep: 'asc' } as any,
              include: { ingredient: { include: { bins: true } } },
            },
          },
        },
        productExecutions: {
          orderBy: { productSequence: 'asc' },
        },
      } as any,
    })) as BatchWithWeighingRelations | null;
    if (!batch) throw new NotFoundException('Batch not found');

    const totalIngredientsPerProduct = batch.steps.reduce(
      (acc, step) => acc + step.ingredients.length,
      0
    );

    const productExecutions = batch.productExecutions.sort(
      (a, b) => a.productSequence - b.productSequence
    );

    for (const pe of productExecutions) {
      const weighedCount = await this.prisma.weighedBag.count({
        where: { batchId, productExecutionId: pe.id },
      });

      if (weighedCount < totalIngredientsPerProduct) {
        // this is the active product
        // now find missing ingredient
      }
    }

    for (const pe of productExecutions) {
      const weighedCount = await this.prisma.weighedBag.count({
        where: { batchId, productExecutionId: pe.id } as any,
      });

      if (weighedCount >= totalIngredientsPerProduct) {
        continue;
      }

      // 1️⃣ Kneader steps first
      for (const step of batch.steps
        .filter((s) => s.stepType === 'KNEADER')
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber)) {
        for (const bi of step.ingredients.sort(
          (a, b) => (a as any).sequenceInStep - (b as any).sequenceInStep
        )) {
          const existing = await this.prisma.weighedBag.findFirst({
            where: {
              batchId,
              productExecutionId: pe.id,
              batchStepId: step.id,
              batchIngredientId: bi.id,
            } as any,
          });

          if (!existing) {
            return {
              batchId,
              productExecutionId: pe.id,
              productSequence: pe.productSequence,
              batchStepId: step.id,
              batchIngredientId: bi.id,
              stepType: step.stepType,
              stepSequenceNumber: step.sequenceNumber,
              ingredientId: bi.ingredientId,
              ingredientCode: bi.ingredient?.ingredientCode ?? '',
              ingredientName: bi.ingredient?.name ?? '',
              binNumber: bi.ingredient?.bins?.[0]?.binNumber ?? null,
              requiredWeight: bi.quantityPerUnit,
              unit: bi.unit,
              sequenceInStep: (bi as any).sequenceInStep,
            };
          }
        }
      }

      // 2️⃣ Mixer steps after kneader
      for (const step of batch.steps
        .filter((s) => s.stepType === 'MIXING')
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber)) {
        for (const bi of step.ingredients.sort(
          (a, b) => (a as any).sequenceInStep - (b as any).sequenceInStep
        )) {
          const existing = await this.prisma.weighedBag.findFirst({
            where: {
              batchId,
              productExecutionId: pe.id,
              batchStepId: step.id,
              batchIngredientId: bi.id,
            } as any,
          });

          if (!existing) {
            return {
              batchId,
              productExecutionId: pe.id,
              productSequence: pe.productSequence,
              batchStepId: step.id,
              batchIngredientId: bi.id,
              stepType: step.stepType,
              stepSequenceNumber: step.sequenceNumber,
              ingredientId: bi.ingredientId,
              ingredientCode: bi.ingredient?.ingredientCode ?? '',
              ingredientName: bi.ingredient?.name ?? '',
              binNumber: bi.ingredient?.bins?.[0]?.binNumber ?? null,
              requiredWeight: bi.quantityPerUnit,
              unit: bi.unit,
              sequenceInStep: (bi as any).sequenceInStep,
            };
          }
        }
      }

      return null; // all done
    }

    return null;
  }

  async weighIngredient(
    batchId: number,
    dto: import('./dto/weigh.dto').WeighDto
  ) {
    if (dto.batchId && dto.batchId !== batchId) {
      throw new BadRequestException('Batch ID mismatch');
    }

    const batch = (await this.prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        productExecutions: { orderBy: { productSequence: 'asc' } },
      },
    })) as BatchWithExecutions | null;

    if (!batch) throw new NotFoundException('Batch not found');

    const productExecutions = [...batch.productExecutions].sort(
      (a, b) => a.productSequence - b.productSequence
    );

    // calculate total ingredients
    const stepsWithIngredients = await this.prisma.batchStep.findMany({
      where: { batchId },
      include: { ingredients: true },
    });

    const totalIngredientsPerProduct = stepsWithIngredients.reduce(
      (acc, step) => acc + step.ingredients.length,
      0
    );

    // find the first product where weighing is not completed
    let activeProduct: (typeof productExecutions)[number] | null = null;
    for (const p of productExecutions) {
      const count = await this.prisma.weighedBag.count({
        where: { batchId, productExecutionId: p.id },
      });

      if (count < totalIngredientsPerProduct) {
        activeProduct = p;
        break;
      }
    }

    if (!activeProduct) {
      throw new BadRequestException('All products are already weighed!');
    }

    const batchIngredient = await this.prisma.batchIngredient.findUnique({
      where: { id: dto.batchIngredientId },
      include: { batchStep: true },
    });
    if (
      !batchIngredient ||
      batchIngredient.batchStepId !== dto.batchStepId ||
      batchIngredient.batchStep.batchId !== batchId
    ) {
      throw new BadRequestException('Invalid step/ingredient for this batch');
    }

    if (dto.weight !== batchIngredient.quantityPerUnit) {
      throw new BadRequestException('Weight does not match required quantity');
    }

    return this.prisma.$transaction(async (tx: any) => {
      const existing = await tx.weighedBag.findFirst({
        where: {
          batchId,
          productExecutionId: activeProduct.id,
          batchStepId: dto.batchStepId,
          batchIngredientId: dto.batchIngredientId,
        } as any,
      });
      if (existing) {
        throw new BadRequestException(
          'Ingredient already weighed for this product'
        );
      }

      const qrId =
        dto.label ??
        `WB-BATCH${batchId}-P${activeProduct.productSequence}-S${
          dto.batchStepId
        }-I${dto.batchIngredientId}-${Date.now()}`;

      const weighedBag = await tx.weighedBag.create({
        data: {
          qrId,
          batchId,
          productExecutionId: activeProduct.id,
          batchStepId: dto.batchStepId,
          batchIngredientId: dto.batchIngredientId,
          weight: dto.weight,
          status: 'CREATED',
        } as any,
      });

      // Update product execution status (weighing started/completed)
      const stepsWithIngredients = await tx.batchStep.findMany({
        where: { batchId },
        include: { ingredients: true },
      });
      const totalIngredientsPerProduct = stepsWithIngredients.reduce(
        (acc: number, s: any) => acc + s.ingredients.length,
        0
      );

      // Recount AFTER inserting the weighed bag
      const newCount = await tx.weighedBag.count({
        where: { batchId, productExecutionId: activeProduct.id },
      });

      const statusUpdate: any = {};

      // First weighing ever → mark start
      if (!activeProduct.weighingStartedAt) {
        statusUpdate.weighingStartedAt = new Date();
        statusUpdate.status = 'WEIGHING_IN_PROGRESS';
      }

      // Last weighing → NOW mark completed
      if (newCount >= totalIngredientsPerProduct) {
        statusUpdate.weighingCompletedAt = new Date();
        statusUpdate.status = 'WEIGHING_COMPLETED';
      }

      if (Object.keys(statusUpdate).length > 0) {
        await tx.productExecution.update({
          where: { id: activeProduct.id },
          data: statusUpdate,
        });
      }

      return weighedBag;
    });
  }

  async getWeighedList(batchId: number) {
    const list = await this.prisma.weighedBag.findMany({
      where: { batchId },
      orderBy: [
        { productExecution: { productSequence: 'asc' } },
        { batchStep: { sequenceNumber: 'asc' } },
        { batchIngredient: { sequenceInStep: 'asc' } },
        { id: 'asc' }, // Always safe fallback
      ],
      include: {
        batchIngredient: {
          include: { ingredient: true },
        },
        batchStep: true,
        productExecution: true,
      },
    });

    return list.map((w) => ({
      id: w.id,
      qrId: w.qrId,
      productSequence: w.productExecution.productSequence,
      ingredientCode: w.batchIngredient.ingredient.ingredientCode,
      ingredientName: w.batchIngredient.ingredient.name,
      weight: w.weight,
      batchStepId: w.batchStepId,
      batchIngredientId: w.batchIngredientId,
      sequenceInStep: w.batchIngredient.sequenceInStep,
      stepType: w.batchStep.stepType, // Add step type (KNEADER or MIXING)
      stepSequenceNumber: w.batchStep.sequenceNumber, // Add step sequence number
    }));
  }

  // bulk weighing helpers

  async startBulkWeighing(batchId: number) {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        steps: { include: { ingredients: true } },
        weighedBags: true,
        bulkSeeds: true,
        productExecutions: true,
      },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    // If already used sequential
    if (
      batch.weighingStrategy === 'ONE_BY_ONE' &&
      (batch.weighedBags.length > 0 || batch.status !== 'CREATED')
    ) {
      throw new BadRequestException(
        'Batch already started in SEQUENTIAL mode. Bulk mode not allowed.'
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Ensure product executions exist
      let productExecutions = await tx.productExecution.findMany({
        where: { batchId },
      });

      if (productExecutions.length === 0) {
        // create same as startExecution does
        for (let seq = 1; seq <= batch.quantity; seq++) {
          const pe = await tx.productExecution.create({
            data: {
              batchId,
              productSequence: seq,
              status: 'CREATED',
            },
          });

          for (const step of batch.steps) {
            await tx.stepExecution.create({
              data: {
                productExecutionId: pe.id,
                batchStepId: step.id,
                status: 'PENDING',
                ingredientsExpected: step.ingredients.length,
              },
            });
          }
        }

        productExecutions = await tx.productExecution.findMany({
          where: { batchId },
        });
      }

      // 2. Create seeds for every (product, step, ingredient) combo if missing
      for (const pe of productExecutions) {
        for (const step of batch.steps) {
          for (const bi of step.ingredients) {
            const existingSeed = await tx.bulkWeighingSeed.findFirst({
              where: {
                batchId,
                productExecutionId: pe.id,
                batchStepId: step.id,
                batchIngredientId: bi.id,
              },
            });

            if (!existingSeed) {
              const qrId = `WB-BULK-B${batchId}-P${pe.productSequence}-S${
                step.id
              }-I${bi.id}-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

              await tx.bulkWeighingSeed.create({
                data: {
                  qrId,
                  batchId,
                  productExecutionId: pe.id,
                  batchStepId: step.id,
                  batchIngredientId: bi.id,
                  status: 'CREATED',
                },
              });
            }
          }
        }
      }

      // 3. Mark batch as BULK weighing
      await tx.batch.update({
        where: { id: batchId },
        data: {
          status: 'WEIGHING',
          weighingStrategy: 'BULK',
        },
      });

      return { ok: true };
    });
  }

  async getBulkLabelList(batchId: number) {
    const seeds = await this.prisma.bulkWeighingSeed.findMany({
      where: { batchId },
      orderBy: [
        { productExecution: { productSequence: 'asc' } },
        { batchStep: { sequenceNumber: 'asc' } },
        { batchIngredient: { sequenceInStep: 'asc' } },
      ],
      include: {
        productExecution: true,
        batchStep: true,
        batchIngredient: {
          include: { ingredient: { include: { bins: true } } },
        },
      },
    });

    return seeds.map((s) => ({
      qrId: s.qrId,
      productSequence: s.productExecution.productSequence,
      stepType: s.batchStep.stepType,
      stepSequenceNumber: s.batchStep.sequenceNumber,
      ingredientCode: s.batchIngredient.ingredient.ingredientCode,
      ingredientName: s.batchIngredient.ingredient.name,
      binNumber: s.batchIngredient.ingredient.bins[0]?.binNumber ?? null,
      status: s.status,
    }));
  }

  async scanBulkQr(batchId: number, qrId: string) {
    const seed = await this.prisma.bulkWeighingSeed.findUnique({
      where: { qrId },
      include: {
        batch: true,
        productExecution: true,
        batchStep: true,
        batchIngredient: {
          include: { ingredient: { include: { bins: true } } },
        },
      },
    });

    if (!seed || seed.batchId !== batchId) {
      throw new BadRequestException('QR does not belong to this batch');
    }

    if (seed.status === 'WEIGHED') {
      throw new BadRequestException('This QR has already been weighed');
    }

    if (seed.status !== 'SCANNED') {
      await this.prisma.bulkWeighingSeed.update({
        where: { id: seed.id },
        data: { status: 'SCANNED' },
      });
    }

    const bi = seed.batchIngredient;

    return {
      batchId: seed.batchId,
      productExecutionId: seed.productExecutionId,
      productSequence: seed.productExecution.productSequence,
      batchStepId: seed.batchStepId,
      batchIngredientId: seed.batchIngredientId,
      stepType: seed.batchStep.stepType,
      stepSequenceNumber: seed.batchStep.sequenceNumber,
      ingredientId: bi.ingredientId,
      ingredientCode: bi.ingredient.ingredientCode,
      ingredientName: bi.ingredient.name,
      binNumber: bi.ingredient.bins[0]?.binNumber ?? null,
      requiredWeight: bi.quantityPerUnit,
      unit: bi.unit,
      sequenceInStep: bi.sequenceInStep,
      qrId: seed.qrId,
      status: seed.status,
    };
  }

  async weighBulkIngredient(
    batchId: number,
    dto: import('./dto/bulk-weigh.dto').BulkWeighDto
  ) {
    const seed = await this.prisma.bulkWeighingSeed.findUnique({
      where: { qrId: dto.qrId },
      include: {
        productExecution: true,
        batchStep: true,
        batchIngredient: true,
      },
    });

    if (!seed || seed.batchId !== batchId) {
      throw new BadRequestException('QR does not belong to this batch');
    }

    if (seed.status === 'WEIGHED') {
      throw new BadRequestException('This QR has already been weighed');
    }

    const bi = await this.prisma.batchIngredient.findUnique({
      where: { id: seed.batchIngredientId },
      include: { batchStep: true },
    });

    if (!bi || bi.batchStep.batchId !== batchId) {
      throw new BadRequestException('Invalid ingredient for this batch');
    }

    if (dto.weight !== bi.quantityPerUnit) {
      throw new BadRequestException('Weight does not match required quantity');
    }

    return this.prisma.$transaction(async (tx: any) => {
      // create weighed bag same as sequential
      const weighedBag = await tx.weighedBag.create({
        data: {
          qrId: seed.qrId,
          batchId,
          productExecutionId: seed.productExecutionId,
          batchStepId: seed.batchStepId,
          batchIngredientId: seed.batchIngredientId,
          weight: dto.weight,
          status: 'CREATED',
        },
      });

      // mark seed as WEIGHED
      await tx.bulkWeighingSeed.update({
        where: { id: seed.id },
        data: { status: 'WEIGHED' },
      });

      // update ProductExecution status (reuse same idea as sequential)
      const stepsWithIngredients = await tx.batchStep.findMany({
        where: { batchId },
        include: { ingredients: true },
      });

      const totalIngredientsPerProduct = stepsWithIngredients.reduce(
        (acc: number, s: any) => acc + s.ingredients.length,
        0
      );

      const weighedCount = await tx.weighedBag.count({
        where: {
          batchId,
          productExecutionId: seed.productExecutionId,
        },
      });

      const activeProduct = seed.productExecution;

      const statusUpdate: any = {};
      if (!activeProduct.weighingStartedAt) {
        statusUpdate.weighingStartedAt = new Date();
        statusUpdate.status = 'WEIGHING_IN_PROGRESS';
      }
      if (weighedCount >= totalIngredientsPerProduct) {
        statusUpdate.weighingCompletedAt = new Date();
        statusUpdate.status = 'WEIGHING_COMPLETED';
      }

      if (Object.keys(statusUpdate).length > 0) {
        await tx.productExecution.update({
          where: { id: activeProduct.id },
          data: statusUpdate,
        });
      }

      return weighedBag;
    });
  }

  // execution helpers

  async startExecutionPhase(batchId: number) {
    // Optional: just mark batch as EXECUTING so your progress bar can move
    return this.prisma.batch.update({
      where: { id: batchId },
      data: { status: 'EXECUTING' },
    });
  }

  async startProductExecution(batchId: number, productExecutionId: number) {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
      include: { productExecutions: true },
    });

    const product = batch?.productExecutions.find(
      (p) => p.id === productExecutionId
    );
    if (!product)
      throw new BadRequestException(
        'ProductExecution does not belong to this batch'
      );

    if (product.status !== 'WEIGHING_COMPLETED') {
      throw new BadRequestException(
        'Product not ready for execution (must be WEIGHING_COMPLETED)'
      );
    }

    const otherActive = batch?.productExecutions.find(
      (p) => p.id !== product.id && p.status === 'STEP_IN_PROGRESS'
    );
    if (otherActive) {
      throw new BadRequestException(
        `Another product (P${otherActive.productSequence}) is already in execution`
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.productExecution.update({
        where: { id: product.id },
        data: {
          status: 'STEP_IN_PROGRESS',
          executionStartedAt: product.executionStartedAt ?? new Date(),
        },
      });

      const firstStep = await tx.stepExecution.findFirst({
        where: { productExecutionId: product.id },
        include: { batchStep: true },
        orderBy: { batchStep: { sequenceNumber: 'asc' } } as any,
      });

      const readyStep = await tx.stepExecution.update({
        where: { id: firstStep?.id },
        data: { status: 'READY', startedAt: null },
        include: { batchStep: true },
      });

      return {
        productExecutionId: updatedProduct.id,
        productSequence: updatedProduct.productSequence,
        status: updatedProduct.status,
        step: {
          stepExecutionId: readyStep.id,
          batchStepId: readyStep.batchStepId,
          stepType: readyStep.batchStep.stepType,
          stepSequenceNumber: readyStep.batchStep.sequenceNumber,
          timerSeconds: readyStep.batchStep.timerSeconds,
          pressure: readyStep.batchStep.pressure,
          temperature: readyStep.batchStep.temperature,
          rpm: readyStep.batchStep.rpm,
          ingredientsAdded: readyStep.ingredientsAdded,
          ingredientsExpected: readyStep.ingredientsExpected,
        },
      };
    });
  }

  async startExecutionStep(batchId: number, dto: StartStepDto) {
    const product = await this.prisma.productExecution.findFirst({
      where: { id: dto.productExecutionId, batchId },
    });

    if (!product) {
      throw new BadRequestException(
        'ProductExecution does not belong to this batch'
      );
    }

    if (!dto.batchStepId) {
      throw new BadRequestException('batchStepId is required to start a step');
    }

    // Product must already be in execution
    if (product.status !== 'STEP_IN_PROGRESS') {
      throw new BadRequestException(
        'Product must be in STEP_IN_PROGRESS to start a step'
      );
    }

    const stepExecution = await this.prisma.stepExecution.findFirst({
      where: {
        productExecutionId: product.id,
        batchStepId: dto.batchStepId,
      },
      include: { batchStep: true },
    });

    if (!stepExecution) {
      throw new BadRequestException(
        'StepExecution not found for this product/step'
      );
    }

    // IMPORTANT: if backend has marked this step as READY, we can start it.
    // We no longer re-check previous steps here, because the transition
    // to READY already guarantees the ordering (previous step done).
    if (stepExecution.status !== 'READY') {
      throw new BadRequestException('Step is not READY to start');
    }

    const updated = await this.prisma.stepExecution.update({
      where: { id: stepExecution.id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: stepExecution.startedAt ?? new Date(),
      },
    });

    return {
      ok: true,
      stepExecutionId: updated.id,
      productExecutionId: product.id,
      status: updated.status,
    };
  }

  async scanExecutionQr(batchId: number, dto: ScanExecutionDto) {
    const bag = await this.prisma.weighedBag.findFirst({
      where: { qrId: dto.qrId, batchId },
    });

    if (!bag) {
      throw new BadRequestException(
        'Weighed bag not found for this batch / QR'
      );
    }

    if (!bag.productExecutionId || !bag.batchStepId || !bag.batchIngredientId) {
      throw new BadRequestException('Weighed bag is missing execution links');
    }

    const stepExecution = await this.prisma.stepExecution.findFirst({
      where: {
        productExecutionId: bag.productExecutionId,
        batchStepId: bag.batchStepId,
      },
    });

    if (!stepExecution) {
      throw new BadRequestException('StepExecution not found for scanned QR');
    }

    if (
      stepExecution.status !== 'READY' &&
      stepExecution.status !== 'IN_PROGRESS'
    ) {
      throw new BadRequestException(
        'Step is not ready for scanning ingredients'
      );
    }

    // FIX 4: full scan logic + correct counting
    const existed = await this.prisma.executionScan.findFirst({
      where: {
        qrId: dto.qrId,
        batchId,
        productExecutionId: bag.productExecutionId,
        batchStepId: bag.batchStepId,
        batchIngredientId: bag.batchIngredientId,
      },
    });

    if (existed) {
      throw new BadRequestException('This QR already scanned for this step.');
    }

    const bi = await this.prisma.batchIngredient.findUnique({
      where: { id: bag.batchIngredientId },
    });

    return await this.prisma.$transaction(async (tx) => {
      await tx.executionScan.create({
        data: {
          qrId: dto.qrId,
          batchId,
          productExecutionId: bag.productExecutionId,
          batchStepId: bag.batchStepId,
          batchIngredientId: bag.batchIngredientId,
          sequenceInStep: bi?.sequenceInStep ?? 0,
        },
      });

      await tx.weighedBag.update({
        where: { id: bag.id },
        data: { status: 'SCANNED', scannedForVerification: new Date() },
      });

      const updatedStep = await tx.stepExecution.update({
        where: { id: stepExecution.id },
        data: { ingredientsAdded: { increment: 1 } },
      });

      // NOTE: updatedStep.ingredientsAdded already has incremented value
      const fullyLoaded =
        updatedStep.ingredientsAdded >= updatedStep.ingredientsExpected;

      return {
        ok: true,
        fullyLoaded,
        ingredientsAdded: updatedStep.ingredientsAdded,
        ingredientsExpected: updatedStep.ingredientsExpected,
      };
    });
  }

  async completeExecutionStep(batchId: number, dto: CompleteStepDto) {
    const product = await this.prisma.productExecution.findFirst({
      where: { id: dto.productExecutionId, batchId },
    });

    if (!product) {
      throw new BadRequestException(
        'ProductExecution does not belong to this batch'
      );
    }

    const stepExecution = await this.prisma.stepExecution.findFirst({
      where: {
        productExecutionId: product.id,
        batchStepId: dto.batchStepId,
      },
      include: { batchStep: true },
    });

    if (!stepExecution) {
      throw new BadRequestException(
        'StepExecution not found for this product/step'
      );
    }

    // Allow idempotent
    if (stepExecution.status === 'DONE') {
      return {
        ok: true,
        productExecutionId: product.id,
        allStepsDoneForProduct: false,
        nextStepExecutionId: null,
      };
    }

    if (stepExecution.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Step is not in progress');
    }

    if (stepExecution.ingredientsAdded < stepExecution.ingredientsExpected) {
      throw new BadRequestException(
        'Not all ingredients scanned for this step / product'
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      const doneStep = await tx.stepExecution.update({
        where: { id: stepExecution.id },
        data: {
          status: 'DONE',
          completedAt: new Date(),
        },
        include: { batchStep: true },
      });

      // Fetch all steps for this product (current DB snapshot)
      const allStepsRaw = await this.getOrderedStepExecutionsForProduct(
        product.id
      );

      // Sort by: KNEADER steps first, then MIXING,
      // and inside each type by sequenceNumber
      const sortedSteps = [...allStepsRaw].sort((a, b) => {
        const priority = (s: any) =>
          s.batchStep.stepType === 'KNEADER' ? 1 : 2;

        const pa = priority(a);
        const pb = priority(b);

        if (pa !== pb) return pa - pb;
        return a.batchStep.sequenceNumber - b.batchStep.sequenceNumber;
      });

      // Find index of the step we just finished
      const currentIndex = sortedSteps.findIndex((s) => s.id === doneStep.id);

      // Pick the next step in that global order
      const next =
        currentIndex >= 0 && currentIndex < sortedSteps.length - 1
          ? sortedSteps[currentIndex + 1]
          : null;

      // Mark next step READY (if it exists and isn't already DONE)
      if (next && next.status === 'PENDING') {
        await tx.stepExecution.update({
          where: { id: next.id },
          data: {
            status: 'READY',
            startedAt: null,
          },
        });
      }

      // Product is complete ONLY when all steps are DONE
      const allDone = sortedSteps.every((s) => s.status === 'DONE');

      if (allDone) {
        await tx.productExecution.update({
          where: { id: product.id },
          data: {
            status: 'STEP_COMPLETED',
            executionCompletedAt: new Date(),
          },
        });
      }

      return {
        ok: true,
        productExecutionId: product.id,
        allStepsDoneForProduct: allDone,
        nextStepExecutionId: next?.id ?? null,
      };
    });
  }

  async finalizeProductExecution(batchId: number, dto: FinalizeProductDto) {
    const product = (await this.prisma.productExecution.findFirst({
      where: { id: dto.productExecutionId, batchId },
      include: { stepExecutions: true },
    })) as ProductWithSteps;

    if (!product) {
      throw new BadRequestException(
        'ProductExecution does not belong to this batch'
      );
    }

    const allStepsDone = (product.stepExecutions as any[]).every(
      (s) => s.status === 'DONE'
    );

    if (!allStepsDone) {
      throw new BadRequestException(
        'All steps must be DONE before finalizing product'
      );
    }

    const existingFinal = await this.prisma.finalProduct.findFirst({
      where: {
        batchId,
        productExecutionId: product.id,
      },
    });

    if (existingFinal) {
      return {
        ok: true,
        finalProductId: existingFinal.id,
        qrId: existingFinal.qrId,
        alreadyExists: true,
      };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const qrId = `FP-B${batchId}-P${product.productSequence}-${Date.now()}`;

      const final = await tx.finalProduct.create({
        data: {
          batchId,
          productExecutionId: product.id,
          productSequence: product.productSequence,
          qrId,
        },
      });

      await tx.productExecution.update({
        where: { id: product.id },
        data: {
          status: 'PRODUCT_COMPLETED',
        },
      });

      // If all products completed -> mark batch COMPLETED
      const allProducts = await tx.productExecution.findMany({
        where: { batchId },
      });

      const allCompleted = allProducts.every(
        (p) => p.status === 'PRODUCT_COMPLETED'
      );

      if (allCompleted) {
        await tx.batch.update({
          where: { id: batchId },
          data: { status: 'COMPLETED' },
        });
      }

      return { final, allCompleted };
    });

    return {
      ok: true,
      finalProductId: result.final.id,
      qrId: result.final.qrId,
      batchId,
      productExecutionId: product.id,
      productSequence: product.productSequence,
      batchCompleted: result.allCompleted,
      createdAt: result.final.createdAt,
    };
  }

  async getFinalizedProductQr(batchId: number, productExecutionId: number) {
    const final = await this.prisma.finalProduct.findFirst({
      where: { batchId, productExecutionId },
    });

    if (!final) {
      throw new BadRequestException('QR not generated yet for this product');
    }

    const product = await this.prisma.productExecution.findUnique({
      where: { id: productExecutionId },
    });

    return {
      qrId: final.qrId,
      batchId,
      productExecutionId,
      productSequence: product?.productSequence,
      createdAt: final.createdAt,
    };
  }

  async getExecutionStatus(batchId: number) {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        productExecutions: {
          orderBy: { productSequence: 'asc' },
          include: {
            stepExecutions: {
              include: { batchStep: true },
              orderBy: {
                batchStep: { sequenceNumber: 'asc' },
              } as any,
            },
          },
        },
      } as any,
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    return {
      batchId: batch.id,
      status: batch.status,
      products: (batch.productExecutions as any[]).map((p) => ({
        productExecutionId: p.id,
        productSequence: p.productSequence,
        status: p.status,
        weighingStartedAt: p.weighingStartedAt,
        weighingCompletedAt: p.weighingCompletedAt,
        executionStartedAt: p.executionStartedAt,
        executionCompletedAt: p.executionCompletedAt,
        steps: (p.stepExecutions as any[]).map((s) => ({
          stepExecutionId: s.id,
          batchStepId: s.batchStepId,
          stepType: s.batchStep.stepType,
          sequenceNumber: s.batchStep.sequenceNumber,
          status: s.status,
          ingredientsAdded: s.ingredientsAdded,
          ingredientsExpected: s.ingredientsExpected,
        })),
      })),
    };
  }

  async getActiveExecutionStep(batchId: number, productExecutionId: number) {
    const product = await this.prisma.productExecution.findFirst({
      where: { id: productExecutionId, batchId },
      include: {
        stepExecutions: {
          include: { batchStep: true },
          orderBy: { batchStep: { sequenceNumber: 'asc' } },
        },
      },
    });

    if (!product) {
      throw new BadRequestException(
        'ProductExecution does not belong to this batch'
      );
    }

    // 1️⃣ Priority: return IN_PROGRESS
    let step = product.stepExecutions.find((s) => s.status === 'IN_PROGRESS');

    // 2️⃣ Next priority: return READY
    if (!step) {
      step = product.stepExecutions.find((s) => s.status === 'READY');
    }

    // 3️⃣ Fallback: return FIRST step that is NOT DONE
    if (!step) {
      step = product.stepExecutions.find((s) => s.status !== 'DONE');
    }

    if (!step) {
      throw new BadRequestException('All steps completed for this product');
    }

    const batchStep = await this.prisma.batchStep.findUnique({
      where: { id: step.batchStepId },
      include: {
        ingredients: {
          include: { ingredient: true },
          orderBy: { sequenceInStep: 'asc' },
        },
      },
    });

    const scans = await this.prisma.executionScan.findMany({
      where: {
        batchId,
        productExecutionId,
        batchStepId: batchStep?.id,
      },
      include: {
        batchIngredient: { include: { ingredient: true } },
      },
      orderBy: { sequenceInStep: 'asc' },
    });

    let remainingSeconds = null;

    if (step.status === 'IN_PROGRESS' && step.startedAt) {
      const now = new Date();
      const elapsed = Math.floor(
        (now.getTime() - step.startedAt.getTime()) / 1000
      );
      const timerSeconds = batchStep?.timerSeconds ?? 0;
      remainingSeconds = Math.max(timerSeconds - elapsed, 0);
    }

    return {
      productExecutionId: product.id,
      productSequence: product.productSequence,
      stepExecutionId: step.id,
      batchStepId: batchStep?.id,
      stepType: batchStep?.stepType,
      sequenceNumber: batchStep?.sequenceNumber,
      stepStatus: step.status,
      timerSeconds: batchStep?.timerSeconds,
      remainingSeconds,
      pressure: batchStep?.pressure,
      temperature: batchStep?.temperature,
      rpm: batchStep?.rpm,
      expectedIngredients: batchStep?.ingredients.map((bi) => {
        const scanned = scans.some((s) => s.batchIngredientId === bi.id);
        return {
          batchIngredientId: bi.id,
          stepNumber: batchStep.sequenceNumber,
          stepType: batchStep.stepType,
          ingredientCode: bi.ingredient.ingredientCode,
          ingredientName: bi.ingredient.name,
          quantityPerUnit: bi.quantityPerUnit,
          unit: bi.unit,
          scanned,
        };
      }),
      executedIngredients: scans.map((s) => ({
        qrId: s.qrId,
        ingredientCode: s.batchIngredient.ingredient.ingredientCode,
        ingredientName: s.batchIngredient.ingredient.name,
      })),
    };
  }

  async finalizeBatch(batchId: number) {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
      include: { productExecutions: true },
    });

    if (!batch) {
      throw new BadRequestException('Batch not found');
    }

    const allProductsDone = batch.productExecutions.every(
      (p) => p.status === 'PRODUCT_COMPLETED'
    );

    if (!allProductsDone) {
      throw new BadRequestException(
        'All products must be PRODUCT_COMPLETED before generating Batch QR'
      );
    }

    const existing = await this.prisma.finalBatch.findFirst({
      where: { batchId },
    });

    if (existing) {
      return {
        ok: true,
        alreadyExists: true,
        qrId: existing.qrId,
        finalBatchId: existing.id,
        createdAt: existing.createdAt,
      };
    }

    const qrId = `FB-${batchId}-${Date.now()}`;

    const created = await this.prisma.finalBatch.create({
      data: {
        batchId,
        qrId,
      },
    });

    await this.prisma.batch.update({
      where: { id: batchId },
      data: { status: 'COMPLETED' },
    });

    return {
      ok: true,
      qrId: created.qrId,
      finalBatchId: created.id,
      createdAt: created.createdAt,
    };
  }

  async getBatchQr(batchId: number) {
    const final = await this.prisma.finalBatch.findUnique({
      where: { batchId },
    });

    if (!final) {
      throw new BadRequestException('Batch QR not generated yet');
    }

    return {
      qrId: final.qrId,
      batchId,
      createdAt: final.createdAt,
    };
  }
}
