import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IngredientExecutionStatus,
  Prisma,
  KneaderExecutionStatus,
  BatchProcessStatus,
  RecipeStep,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteStageDto, ScanKneaderDto } from './dto/scan-kneader.dto';
import { RecipeWrittenDto } from './dto/recipe-written.dto';
import { KneaderResult } from './types/kneader-response.type';
import { StepType } from '../recipe/dto/create-recipe.dto';

@Injectable()
export class KneaderService {
  constructor(private readonly prisma: PrismaService) {}

  async scan(dto: ScanKneaderDto) {
    return this.prisma.$transaction(async (tx) => {
      const executionIngredient = await tx.executionIngredient.findUnique({
        where: {
          qrId: dto.qrId,
        },
        include: {
          ingredient: {
            include: {
              bins: true,
            },
          },

          recipeStep: {
            include: {
              ingredients: true,
            },
          },

          executionBatch: {
            include: {
              kneaderExecution: true,

              execution: {
                include: {
                  recipe: {
                    include: {
                      steps: {
                        include: {
                          ingredients: {
                            include: {
                              ingredient: true,
                            },
                          },
                        },
                        orderBy: {
                          sequenceNumber: 'asc',
                        },
                      },
                    },
                  },
                },
              },

              ingredients: {
                include: {
                  ingredient: true,
                  recipeStep: true,
                },
                orderBy: {
                  plcIngredientIndex: 'asc',
                },
              },
            },
          },
        },
      });

      if (!executionIngredient) {
        throw new NotFoundException('Invalid QR Code.');
      }

      const batch = executionIngredient.executionBatch;

      const kneaderExecution = batch.kneaderExecution;

      if (!kneaderExecution) {
        throw new NotFoundException('Kneader execution not found.');
      }

      if (kneaderExecution.status === 'COMPLETED') {
        return {
          result: KneaderResult.WRONG_BATCH,
          writeRecipe: false,
          scanNext: false,
          readyToStart: false,
          batchComplete: false,
        };
      }

      if (executionIngredient.actualQuantity === null) {
        return {
          result: KneaderResult.WEIGH_NOT_DONE,
        };
      }

      if (executionIngredient.status === IngredientExecutionStatus.CONSUMED) {
        return {
          result: KneaderResult.PROCESS_ALREADY_DONE,
        };
      }

      if (executionIngredient.kneaderScanned) {
        return {
          result: KneaderResult.DUPLICATE_SCAN,
          writeRecipe: false,
          scanNext: false,
          readyToStart: false,
          batchComplete: false,
        };
      }

      const currentRecipeStep = this.getCurrentStep(batch);

      if (!currentRecipeStep) {
        return {
          result: KneaderResult.PROCESS_ALREADY_DONE,
          writeRecipe: false,
          scanNext: false,
          readyToStart: false,
          batchComplete: true,
        };
      }

      if (
        executionIngredient.recipeStep.sequenceNumber !==
        currentRecipeStep.sequenceNumber
      ) {
        return {
          result: KneaderResult.WRONG_STAGE,
          writeRecipe: false,
          scanNext: false,
          readyToStart: false,
          batchComplete: false,
        };
      }

      await tx.executionIngredient.update({
        where: {
          id: executionIngredient.id,
        },
        data: {
          kneaderScanned: true,
        },
      });

      const currentStepIngredients = this.getCurrentStepIngredients(
        batch.ingredients,
        currentRecipeStep.id
      );

      const scannedCount = await tx.executionIngredient.count({
        where: {
          executionBatchId: batch.id,
          recipeStepId: currentRecipeStep.id,
          kneaderScanned: true,
        },
      });

      const totalIngredients = currentStepIngredients.length;

      const allScanned = scannedCount === totalIngredients;

      return {
        result: KneaderResult.VALID,

        executionBatchId: batch.id,

        writeRecipe: !kneaderExecution.recipeWritten,

        recipeCode: batch.execution.recipe.recipeCode,

        stageTimings: this.buildStageTimings(batch.execution.recipe.steps),

        totalStages: batch.execution.recipe.steps.filter(
          (step) => step.stepType === StepType.KNEADER
        ).length,

        readyToStart: allScanned,

        scanNext: !allScanned,

        batchComplete: false,
      };
    });
  }

  async completeStage(dto: CompleteStageDto) {
    return this.prisma.$transaction(async (tx) => {
      const batch = await tx.executionBatch.findUnique({
        where: {
          id: dto.executionBatchId,
        },
        include: {
          kneaderExecution: true,

          execution: {
            include: {
              recipe: {
                include: {
                  steps: {
                    orderBy: {
                      sequenceNumber: 'asc',
                    },
                  },
                },
              },
            },
          },

          ingredients: {
            include: {
              recipeStep: true,
            },
          },
        },
      });

      if (!batch) {
        throw new NotFoundException('Execution batch not found.');
      }

      if (!batch.kneaderExecution) {
        throw new NotFoundException('Kneader execution not found.');
      }

      const kneaderExecution = batch.kneaderExecution;

      const currentStep = batch.execution.recipe.steps.find(
        (step) => step.sequenceNumber === kneaderExecution.currentStepSequence
      );

      if (!currentStep) {
        throw new NotFoundException('Current kneader step not found.');
      }

      const pendingScans = await tx.executionIngredient.count({
        where: {
          executionBatchId: batch.id,
          recipeStepId: currentStep.id,
          kneaderScanned: false,
          status: IngredientExecutionStatus.WEIGHED,
        },
      });

      if (pendingScans > 0) {
        throw new BadRequestException(
          'All ingredients of the current stage have not been scanned.'
        );
      }

      await tx.executionIngredient.updateMany({
        where: {
          executionBatchId: batch.id,
          recipeStepId: currentStep.id,
        },
        data: {
          status: IngredientExecutionStatus.CONSUMED,
          kneaderScanned: false,
        },
      });

      const nextStep = batch.execution.recipe.steps.find(
        (step) =>
          step.sequenceNumber === kneaderExecution.currentStepSequence + 1
      );

      if (nextStep) {
        await tx.kneaderExecution.update({
          where: {
            executionBatchId: batch.id,
          },
          data: {
            currentStepSequence: nextStep.sequenceNumber,
          },
        });

        return {
          success: true,
          stageCompleted: true,
          batchCompleted: false,
          nextStepSequence: nextStep.sequenceNumber,
        };
      }

      return this.finishKneader(tx, batch);
    });
  }

  async recipeWritten(dto: RecipeWrittenDto) {
    await this.prisma.kneaderExecution.update({
      where: {
        executionBatchId: dto.executionBatchId,
      },
      data: {
        recipeWritten: true,
      },
    });

    return {
      success: true,
    };
  }

  private async finishKneader(tx: Prisma.TransactionClient, batch: any) {
    await tx.kneaderExecution.update({
      where: {
        executionBatchId: batch.id,
      },
      data: {
        status: KneaderExecutionStatus.COMPLETED,
      },
    });

    await tx.executionBatch.update({
      where: {
        id: batch.id,
      },
      data: {
        kneaderStatus: BatchProcessStatus.COMPLETED,
      },
    });

    const qrId = `MB-${batch.execution.executionCode}-B${batch.batchNumber}`;

    const masterBatch = await tx.masterBatch.create({
      data: {
        qrId,
        executionBatchId: batch.id,
        recipeId: batch.execution.recipe.id,
      },
    });

    await tx.mixingExecution.create({
      data: {
        executionBatchId: batch.id,
      },
    });

    return {
      success: true,
      stageCompleted: true,
      batchCompleted: true,

      masterBatchId: masterBatch.id,

      qrId: masterBatch.qrId,

      recipeCode: batch.execution.recipe.recipeCode,

      batchNumber: batch.batchNumber,
    };
  }

  private getCurrentStep(batch: any) {
    return batch.execution.recipe.steps.find(
      (step: { sequenceNumber: any }) =>
        step.sequenceNumber === batch.kneaderExecution.currentStepSequence
    );
  }

  private getCurrentStepIngredients(
    batchIngredients: any[],
    recipeStepId: number
  ) {
    return batchIngredients.filter(
      (ingredient) => ingredient.recipeStepId === recipeStepId
    );
  }

  private buildStageTimings(steps: RecipeStep[]) {
    const timings: number[] = [];

    const kneaderSteps = steps
      .filter((step) => step.stepType === StepType.KNEADER)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    for (const step of kneaderSteps) {
      timings.push(step.timerSeconds);
    }

    while (timings.length < 5) {
      timings.push(0);
    }

    return timings;
  }
}
