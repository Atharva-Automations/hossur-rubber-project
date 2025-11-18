// src/batch/batch.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBatchDto } from './dto/create-batch.dto';
// import { WeighDto } from './dto/weigh.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
// import { ScanDto } from './dto/scan.dto';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor(private readonly prisma: PrismaService) {}

  // list all batches (with some relations)
  async findAll() {
    return this.prisma.batch.findMany({
      include: {
        recipe: true,
        steps: {
          include: {
            ingredients: { include: { ingredient: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // get one batch (more detailed)
  async findOne(id: number) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        recipe: true,
        steps: {
          orderBy: { sequenceNumber: 'asc' },
          include: {
            ingredients: { include: { ingredient: true } },
            weighedBags: true,
            executionScans: true,
          },
        },
        weighedBags: true,
        finalProducts: true,
      },
    });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  // Create batch: instantiate Batch, BatchSteps, BatchIngredients
  async create(dto: CreateBatchDto) {
    // fetch recipe and steps
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: dto.recipeId },
      include: {
        steps: {
          include: {
            ingredients: { include: { ingredient: true } },
          },
        },
      },
    });
    if (!recipe) throw new BadRequestException('Recipe not found');

    // filter steps by selected modules
    const recipeStepsFiltered = recipe.steps.filter(
      (s) =>
        (s.stepType === 'KNEADER' && dto.enableKneader) ||
        (s.stepType === 'MIXING' && dto.enableMixing)
    );

    if (recipeStepsFiltered.length === 0) {
      throw new BadRequestException(
        'No steps selected (enableKneader/enableMixing).'
      );
    }

    // Use a transaction to create Batch and nested data
    const batch = await this.prisma.$transaction(async (tx) => {
      const createdBatch = await tx.batch.create({
        data: {
          recipeId: dto.recipeId,
          quantity: dto.quantity,
          status: 'CREATED', // store enum value as string
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

        for (const ri of s.ingredients) {
          // ri.quantity is recipe per-unit quantity
          const quantityPerUnit = Number(ri.quantity || 0);
          await tx.batchIngredient.create({
            data: {
              batchStepId: bs.id,
              ingredientId: ri.ingredientId,
              quantityPerUnit,
              totalQuantity: quantityPerUnit * dto.quantity,
              unit: ri.unit,
            },
          });
        }
      }

      return createdBatch;
    });

    return batch;
  }

  // Delete
  async delete(id: number) {
    await this.prisma.batch.delete({ where: { id } });
    return { ok: true };
  }

  async findOneWithDetails(batchId: number) {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        recipe: true, // read-only recipe info for UI
        steps: {
          include: {
            ingredients: {
              include: { ingredient: true },
            },
          },
        },
        weighedBags: true,
      },
    });
    if (!batch) throw new BadRequestException('Batch not found');
    return batch;
  }

  // Update only batch-level and step/ingredient runtime fields
  // async updateBatch(batchId: number, dto: UpdateBatchDto) {
  //   const batch = await this.prisma.batch.findUnique({
  //     where: { id: batchId },
  //     include: { steps: { include: { ingredients: true } } },
  //   });
  //   if (!batch) throw new BadRequestException('Batch not found');

  //   // 1) Update batch meta (quantity and module flags)
  //   await this.prisma.batch.update({
  //     where: { id: batchId },
  //     data: {
  //       quantity: dto.quantity,
  //       // status unchanged, createdAt unchanged
  //     },
  //   });

  //   // 2) Update each BatchStep and its BatchIngredient children
  //   // We assume the client sends only existing step IDs (we're editing, not creating new steps here)
  //   for (const s of dto.steps) {
  //     // update step fields
  //     await this.prisma.batchStep.update({
  //       where: { id: s.id },
  //       data: {
  //         timerSeconds: s.timerSeconds,
  //         pressure: s.pressure,
  //         temperature: s.temperature,
  //         rpm: s.rpm,
  //       },
  //     });

  //     // update each ingredient (by its BatchIngredient id)
  //     for (const bi of s.ingredients) {
  //       await this.prisma.batchIngredient.update({
  //         where: { id: bi.id },
  //         data: {
  //           quantityPerUnit: bi.quantityPerUnit,
  //           unit: bi.unit ?? undefined,
  //           // if you have totalQuantity derived, you can recalc here: totalQuantity = quantityPerUnit * batch.quantity
  //         },
  //       });
  //     }
  //   }

  //   // 3) Optionally recalc totals for each BatchIngredient (if you want to persist totalQuantity)
  //   const updatedBatch = await this.prisma.batch.findUnique({
  //     where: { id: batchId },
  //     include: { steps: { include: { ingredients: true } } },
  //   });

  //   // recalc totalQuantity for each BatchIngredient = quantityPerUnit * batch.quantity
  //   if (updatedBatch) {
  //     for (const step of updatedBatch.steps) {
  //       for (const bi of step.ingredients) {
  //         const newTotal =
  //           (bi.quantityPerUnit || 0) * (updatedBatch.quantity || 1);
  //         await this.prisma.batchIngredient.update({
  //           where: { id: bi.id },
  //           data: { totalQuantity: newTotal },
  //         });
  //       }
  //     }
  //   }

  //   return { success: true };
  // }

  // async updateBatch(batchId: number, dto: any) {
  //   // Basic validation
  //   if (!Number.isInteger(batchId) || batchId <= 0) {
  //     throw new BadRequestException('Invalid batch id');
  //   }
  //   if (!dto || typeof dto !== 'object') {
  //     throw new BadRequestException('Missing request body');
  //   }
  //   if (!Array.isArray(dto.steps)) {
  //     throw new BadRequestException('steps must be an array');
  //   }

  //   // Helper: normalize ingredient payload for Prisma
  //   const buildIngredientData = (ing: any) => {
  //     // Accept either `quantity` or `quantityPerUnit` from client
  //     const rawQty =
  //       ing.quantityPerUnit ?? // preferred if client provided explicitly
  //       ing.quantity ?? // fallback
  //       0;
  //     const qtyNum = Number(rawQty ?? 0);
  //     if (!Number.isFinite(qtyNum)) {
  //       throw new BadRequestException('Ingredient quantity must be a number');
  //     }

  //     // Always set quantityPerUnit for DB (your schema expects this)
  //     const data: any = {
  //       ingredientId: ing.ingredientId ?? undefined,
  //       quantityPerUnit: qtyNum,
  //       unit: ing.unit ?? undefined,
  //     };

  //     return data;
  //   };

  //   // Load existing steps + their ingredients for this batch
  //   const existingSteps = await this.prisma.batchStep.findMany({
  //     where: { batchId },
  //     include: { ingredients: true },
  //   });

  //   const existingStepMap = new Map<number, any>();
  //   for (const s of existingSteps) existingStepMap.set(s.id, s);

  //   // Which step IDs are incoming (valid integers)
  //   const incomingStepIds = new Set<number>();
  //   for (const s of dto.steps) {
  //     if (s && s.id != null) {
  //       const sid = Number(s.id);
  //       if (Number.isInteger(sid) && sid > 0) incomingStepIds.add(sid);
  //     }
  //   }

  //   // Determine deletes for steps that were removed client-side
  //   const toDeleteStepIds = existingSteps
  //     .map((s) => s.id)
  //     .filter((id) => !incomingStepIds.has(id));

  //   // Build Prisma ops
  //   const ops: any[] = [];

  //   // Delete removed steps (and rely on cascade or explicit ingredient deletes if needed)
  //   if (toDeleteStepIds.length) {
  //     ops.push(
  //       this.prisma.batchStep.deleteMany({
  //         where: { id: { in: toDeleteStepIds } },
  //       })
  //     );
  //   }

  //   // For each incoming step: update existing or create new
  //   for (const stepDto of dto.steps) {
  //     if (!stepDto || typeof stepDto !== 'object') continue;

  //     // Normalize step numeric fields
  //     const stepData: any = {
  //       stepType: stepDto.stepType,
  //       sequenceNumber:
  //         stepDto.sequenceNumber !== undefined
  //           ? Number(stepDto.sequenceNumber)
  //           : 0,
  //       timerSeconds:
  //         stepDto.timerSeconds !== undefined ? Number(stepDto.timerSeconds) : 0,
  //       pressure:
  //         stepDto.pressure !== undefined ? Number(stepDto.pressure) : undefined,
  //       temperature:
  //         stepDto.temperature !== undefined
  //           ? Number(stepDto.temperature)
  //           : undefined,
  //       rpm: stepDto.rpm !== undefined ? Number(stepDto.rpm) : undefined,
  //     };

  //     // If valid id present -> update
  //     const maybeStepId = stepDto.id != null ? Number(stepDto.id) : NaN;
  //     const hasValidStepId = Number.isInteger(maybeStepId) && maybeStepId > 0;

  //     if (hasValidStepId && existingStepMap.has(maybeStepId)) {
  //       const stepId = maybeStepId;

  //       // Update step record
  //       ops.push(
  //         this.prisma.batchStep.update({
  //           where: { id: stepId },
  //           data: stepData,
  //         })
  //       );

  //       // Sync step ingredients: compute deletes, updates, creates
  //       const existingStep = existingStepMap.get(stepId);
  //       const existingIngMap = new Map<number, any>();
  //       (existingStep.ingredients || []).forEach((ing: any) =>
  //         existingIngMap.set(ing.id, ing)
  //       );

  //       // incoming ingredient ids
  //       const incomingIngIds = new Set<number>();
  //       for (const ing of stepDto.ingredients || []) {
  //         if (ing && ing.id != null) {
  //           const iid = Number(ing.id);
  //           if (Number.isInteger(iid) && iid > 0) incomingIngIds.add(iid);
  //         }
  //       }

  //       // delete removed ingredients
  //       const toDeleteIngIds = (existingStep.ingredients || [])
  //         .map((i: any) => i.id)
  //         .filter((id: number) => !incomingIngIds.has(id));
  //       if (toDeleteIngIds.length) {
  //         ops.push(
  //           this.prisma.stepIngredient.deleteMany({
  //             where: { id: { in: toDeleteIngIds } },
  //           })
  //         );
  //       }

  //       // update existing ing or create new
  //       for (const ingDto of stepDto.ingredients || []) {
  //         if (!ingDto) continue;
  //         const maybeIngId = ingDto.id != null ? Number(ingDto.id) : NaN;
  //         const hasValidIngId = Number.isInteger(maybeIngId) && maybeIngId > 0;

  //         const ingPayload = buildIngredientData(ingDto);

  //         if (hasValidIngId && existingIngMap.has(maybeIngId)) {
  //           // Update
  //           ops.push(
  //             this.prisma.stepIngredient.update({
  //               where: { id: maybeIngId },
  //               data: ingPayload,
  //             })
  //           );
  //         } else {
  //           // Create - ensure stepId present
  //           ops.push(
  //             this.prisma.stepIngredient.create({
  //               data: {
  //                 stepId,
  //                 ...ingPayload,
  //               },
  //             })
  //           );
  //         }
  //       }
  //     } else {
  //       // Create new step with nested ingredients
  //       const createStepIngredients = (stepDto.ingredients || []).map(
  //         (ing: any) => buildIngredientData(ing)
  //       );

  //       interface StepIngredientData {
  //         ingredientId?: number;
  //         quantityPerUnit: number;
  //         unit?: string;
  //       }

  //       ops.push(
  //         this.prisma.batchStep.create({
  //           data: {
  //             batchId,
  //             stepType: stepData.stepType as any,
  //             sequenceNumber: stepData.sequenceNumber,
  //             timerSeconds: stepData.timerSeconds,
  //             pressure: stepData.pressure,
  //             temperature: stepData.temperature,
  //             rpm: stepData.rpm,
  //             // nested create ingredients
  //             ingredients: {
  //               create: createStepIngredients.map((p: StepIngredientData) => ({
  //                 ...p,
  //               })),
  //             },
  //           },
  //         })
  //       );
  //     }
  //   } // end for each stepDto

  //   // Update top-level batch fields (only include allowed fields)
  //   const batchUpdateData: any = {};
  //   if (dto.quantity !== undefined) {
  //     const q = Number(dto.quantity);
  //     if (!Number.isFinite(q) || !Number.isInteger(q)) {
  //       throw new BadRequestException('quantity must be an integer number');
  //     }
  //     batchUpdateData.quantity = q;
  //   }
  //   if (dto.status !== undefined) {
  //     batchUpdateData.status = dto.status;
  //   }
  //   // if you allow toggling enableKneader/enableMixing on batch record, include them:
  //   if (dto.enableKneader !== undefined)
  //     batchUpdateData.enableKneader = !!dto.enableKneader;
  //   if (dto.enableMixing !== undefined)
  //     batchUpdateData.enableMixing = !!dto.enableMixing;

  //   if (Object.keys(batchUpdateData).length) {
  //     ops.push(
  //       this.prisma.batch.update({
  //         where: { id: batchId },
  //         data: batchUpdateData,
  //       })
  //     );
  //   }

  //   // execute transaction
  //   try {
  //     await this.prisma.$transaction(ops);
  //   } catch (err) {
  //     this.logger.error('updateBatch transaction failed', err as any);
  //     // rethrow the error so controller returns 500 / proper message
  //     throw err;
  //   }

  //   // return the refreshed batch
  //   return this.prisma.batch.findUnique({
  //     where: { id: batchId },
  //     include: {
  //       steps: {
  //         include: {
  //           ingredients: {
  //             include: {
  //               ingredient: true, // if you want nested ingredient info
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  // }

  async updateBatch(batchId: number, dto: any) {
    // Basic validation
    if (!Number.isInteger(batchId)) {
      throw new BadRequestException('Invalid batch id');
    }
    if (!dto || typeof dto !== 'object') {
      throw new BadRequestException('Invalid payload');
    }
    if (!Array.isArray(dto.steps)) {
      throw new BadRequestException('steps must be an array');
    }

    // Ensure batch exists
    const existingBatch = await this.prisma.batch.findUnique({
      where: { id: batchId },
    });
    if (!existingBatch) {
      throw new BadRequestException('Batch not found');
    }

    // Transactional update to keep DB consistent
    const updated = await this.prisma.$transaction(async (tx) => {
      // 1) Load existing steps and their batch-ingredients etc.
      const existingSteps = await tx.batchStep.findMany({
        where: { batchId },
        include: { ingredients: true }, // ingredients here are BatchIngredient rows
      });
      const existingStepMap = new Map<number, any>();
      for (const s of existingSteps) existingStepMap.set(s.id, s);

      // 2) Determine which steps were removed by client
      const incomingStepIds = new Set<number>();
      for (const s of dto.steps) if (s.id) incomingStepIds.add(Number(s.id));
      const toDeleteStepIds = existingSteps
        .map((s) => s.id)
        .filter((id) => !incomingStepIds.has(id));

      // 3) For steps to delete: delete dependent rows BEFORE deleting the step
      if (toDeleteStepIds.length > 0) {
        // delete weighed bags referencing these steps
        await tx.weighedBag.deleteMany({
          where: { batchStepId: { in: toDeleteStepIds } },
        });

        // delete execution scans referencing these steps
        await tx.executionScan.deleteMany({
          where: { batchStepId: { in: toDeleteStepIds } },
        });

        // delete batchIngredients for these steps
        await tx.batchIngredient.deleteMany({
          where: { batchStepId: { in: toDeleteStepIds } },
        });

        // finally delete the batch steps
        await tx.batchStep.deleteMany({
          where: { id: { in: toDeleteStepIds } },
        });
      }

      // 4) Process incoming steps (update existing OR create new)
      for (const stepDto of dto.steps) {
        const stepType = stepDto.stepType;
        const sequenceNumber = Number(stepDto.sequenceNumber ?? 0);
        const timerSeconds = Number(stepDto.timerSeconds ?? 0);
        const pressure =
          stepDto.pressure === undefined ? undefined : Number(stepDto.pressure);
        const temperature =
          stepDto.temperature === undefined
            ? undefined
            : Number(stepDto.temperature);
        const rpm = stepDto.rpm === undefined ? undefined : Number(stepDto.rpm);

        if (stepDto.id) {
          // existing step -> update
          const stepId = Number(stepDto.id);
          if (!existingStepMap.has(stepId)) {
            throw new BadRequestException(`Step id ${stepId} not found`);
          }

          await tx.batchStep.update({
            where: { id: stepId },
            data: {
              stepType,
              sequenceNumber,
              timerSeconds,
              pressure,
              temperature,
              rpm,
            },
          });

          // Sync batchIngredients for this step
          const existingStep = existingStepMap.get(stepId);
          const existingIngIds = new Set(
            (existingStep.ingredients || []).map((i: any) => i.id)
          );
          const incomingIngIds = new Set<number>();
          for (const ing of stepDto.ingredients || [])
            if (ing.id) incomingIngIds.add(Number(ing.id));

          // Delete removed batchIngredients
          const toDeleteIngIds = (existingStep.ingredients || [])
            .map((i: any) => i.id)
            .filter((id: number) => !incomingIngIds.has(id));
          if (toDeleteIngIds.length) {
            // Also delete weighed bags / execution scans linked to those batchIngredients if applicable
            await tx.weighedBag.deleteMany({
              where: { batchIngredientId: { in: toDeleteIngIds } },
            });
            await tx.batchIngredient.deleteMany({
              where: { id: { in: toDeleteIngIds } },
            });
          }

          // Update existing or create new batchIngredient rows
          for (const ing of stepDto.ingredients || []) {
            const unit = ing.unit ?? 'KG';
            const ingredientId =
              ing.ingredientId ?? ing.ingredient?.id ?? undefined;

            if (ing.id) {
              await tx.batchIngredient.update({
                where: { id: Number(ing.id) },
                data: {
                  ingredientId: ingredientId ?? undefined,
                  quantityPerUnit:
                    Number(ing.quantityPerUnit ?? 0) || undefined,
                  totalQuantity: Number(ing.totalQuantity ?? 0) || undefined,
                  unit,
                } as any,
              });
            } else {
              await tx.batchIngredient.create({
                data: {
                  batchStepId: stepId,
                  ingredientId: ingredientId ?? undefined,
                  quantityPerUnit: Number(
                    ing.quantityPerUnit ?? ing.quantity ?? 0
                  ),
                  totalQuantity: Number(ing.totalQuantity ?? 0),
                  unit,
                },
              });
            }
          }
        } else {
          // new step -> create with nested batchIngredient creates
          const createData: any = {
            batchId,
            stepType,
            sequenceNumber,
            timerSeconds,
            pressure,
            temperature,
            rpm,
          };

          const ingCreates = (stepDto.ingredients || []).map((ing: any) => ({
            ingredientId: ing.ingredientId ?? ing.ingredient?.id ?? undefined,
            quantityPerUnit: Number(ing.quantityPerUnit ?? ing.quantity ?? 0),
            totalQuantity: Number(ing.totalQuantity ?? 0),
            unit: ing.unit ?? 'KG',
          }));

          createData.ingredients = { create: ingCreates };

          await tx.batchStep.create({ data: createData });

          await tx.batchStep.create({ data: createData });
        }
      } // end steps loop

      // 5) Update top-level batch row
      const qtyNum = Number(dto.quantity ?? existingBatch.quantity ?? 0);
      if (!Number.isFinite(qtyNum) || qtyNum < 0) {
        throw new BadRequestException('Invalid quantity');
      }

      await tx.batch.update({
        where: { id: batchId },
        data: {
          quantity: Math.trunc(qtyNum),
          status: dto.status ?? existingBatch.status,
        },
      });

      // 6) Reload and return updated batch with includes
      const refreshed = await tx.batch.findUnique({
        where: { id: batchId },
        include: {
          steps: {
            include: {
              ingredients: {
                include: { ingredient: true },
              },
            },
          },
          recipe: true,
          weighedBags: true,
          executionScans: true,
        },
      });

      return refreshed;
    }); // end transaction

    return updated;
  }

  // Generate bulk QRs (simulation). Returns cycles grouped by recipe-run index.
  // Creates WeighedBag records in CREATED state and returns a shape front-end expects.
  // async generateBulkQrs(batchId: number) {
  //   const batch = await this.prisma.batch.findUnique({
  //     where: { id: batchId },
  //     include: {
  //       steps: {
  //         orderBy: { sequenceNumber: 'asc' },
  //         include: { ingredients: { include: { ingredient: true } } },
  //       },
  //     },
  //   });
  //   if (!batch) throw new NotFoundException('Batch not found');

  //   // cycles: one cycle per run (1..batch.quantity)
  //   const cycles: { cycle: number; bags: any[] }[] = [];

  //   for (let cycle = 1; cycle <= batch.quantity; cycle++) {
  //     const bagsThisCycle: any[] = [];

  //     for (const step of batch.steps) {
  //       for (const ingr of step.ingredients) {
  //         const qrId = this.generateQrId();
  //         const wb = await this.prisma.weighedBag.create({
  //           data: {
  //             qrId,
  //             batchId: batch.id,
  //             batchStepId: step.id,
  //             batchIngredientId: ingr.id,
  //             weight: Number(ingr.quantity) || 0,
  //             status: 'CREATED',
  //           },
  //         });

  //         bagsThisCycle.push({
  //           qrId,
  //           bagId: wb.id,
  //           stepId: step.id,
  //           batchIngredientId: ingr.id,
  //           ingredientCode: ingr.ingredient?.ingredientCode || null,
  //           ingredientName: ingr.ingredient?.name || null,
  //           expectedWeight: ingr.quantity,
  //           unit: ingr.unit,
  //           sequenceNumber: step.sequenceNumber,
  //         });
  //       }
  //     }

  //     cycles.push({ cycle, bags: bagsThisCycle });
  //   }

  //   return { cycles };
  // }

  // Weigh: one-by-one flow -> creates a WeighedBag (simulate printing) and returns it
  // async weigh(dto: WeighDto) {
  //   // ensure batch exists
  //   const b = await this.prisma.batch.findUnique({
  //     where: { id: dto.batchId },
  //   });
  //   if (!b) throw new NotFoundException('Batch not found');

  //   const qrId = this.generateQrId();
  //   const wb = await this.prisma.weighedBag.create({
  //     data: {
  //       qrId,
  //       batchId: dto.batchId,
  //       batchStepId: dto.batchStepId,
  //       batchIngredientId: dto.batchIngredientId,
  //       weight: dto.weight,
  //       status: 'CREATED',
  //     },
  //   });

  //   return wb;
  // }

  // Status - aggregated data used in frontend status panel
  // async status(batchId: number) {
  //   const batch = await this.prisma.batch.findUnique({
  //     where: { id: batchId },
  //     include: {
  //       steps: {
  //         orderBy: { sequenceNumber: 'asc' },
  //         include: {
  //           ingredients: { include: { ingredient: true } },
  //           weighedBags: true,
  //         },
  //       },
  //       weighedBags: true,
  //     },
  //   });
  //   if (!batch) throw new NotFoundException('Batch not found');

  //   const steps = batch.steps.map((s) => ({
  //     id: s.id,
  //     stepType: s.stepType,
  //     sequenceNumber: s.sequenceNumber,
  //     timerSeconds: s.timerSeconds,
  //     status: s.status,
  //     ingredients: s.ingredients.map((i) => ({
  //       id: i.id,
  //       ingredientId: i.ingredientId,
  //       ingredientCode: i.ingredient?.ingredientCode,
  //       totalQuantity: i.totalQuantity,
  //       unit: i.unit,
  //       weighedCount: 0,
  //     })),
  //   }));

  //   for (const wb of batch.weighedBags) {
  //     const st = steps.find((x) => x.id === wb.batchStepId);
  //     if (!st) continue;
  //     const ingr = st.ingredients.find((it) => it.id === wb.batchIngredientId);
  //     if (ingr) ingr.weighedCount = (ingr.weighedCount || 0) + 1;
  //   }

  //   return {
  //     id: batch.id,
  //     recipeId: batch.recipeId,
  //     quantity: batch.quantity,
  //     status: batch.status,
  //     steps,
  //   };
  // }

  // Scan: incoming qrId -> locate weighedBag -> create ExecutionScan -> mark consumed -> optionally update bin currentQuantity
  // async scan(dto: ScanDto) {
  //   const wb = await this.prisma.weighedBag.findUnique({
  //     where: { qrId: dto.qrId },
  //     include: {
  //       batch: true,
  //       batchStep: true,
  //       batchIngredient: { include: { ingredient: true } },
  //     },
  //   });
  //   if (!wb) throw new NotFoundException('QR not found');

  //   if (wb.status === 'CONSUMED') {
  //     return { ok: false, message: 'QR already consumed', qrId: dto.qrId };
  //   }

  //   const scan = await this.prisma.executionScan.create({
  //     data: {
  //       qrId: dto.qrId,
  //       batchId: wb.batchId,
  //       batchStepId: wb.batchStepId,
  //     },
  //   });

  //   await this.prisma.weighedBag.update({
  //     where: { id: wb.id },
  //     data: { status: 'CONSUMED', scannedAt: new Date() as any },
  //   });

  //   // If a bin assignment exists for the ingredient, increment its currentQuantity
  //   const bin = await this.prisma.binAssignment.findUnique({
  //     where: { ingredientId: wb.batchIngredient?.ingredientId ?? -1 },
  //   });
  //   if (bin) {
  //     // increment by wb.weight (careful with units — assume consistent)
  //     await this.prisma.binAssignment.update({
  //       where: { id: bin.id },
  //       data: { currentQuantity: { increment: wb.weight } as any },
  //     });
  //   }

  //   return { ok: true, scan };
  // }

  // small helper
  private generateQrId(length = 8) {
    return Math.random().toString(36).substr(2, length);
  }
}
