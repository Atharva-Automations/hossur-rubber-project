import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MixingResult } from './types/mixing-response.type';
import { ScanMasterBatchDto } from './dto/scan-master-batch.dto';
import {
    BatchProcessStatus,
  IngredientExecutionStatus,
  MasterBatchStatus,
  MixingExecutionStatus,
  Prisma,
} from '@prisma/client';
import { StepType } from '../recipe/dto/create-recipe.dto';
import { ScanIngredientDto } from './dto/scan-ingredient.dto';
import { CompleteStageDto } from './dto/complete-stage.dto';

@Injectable()
export class MixingService {
  constructor(private readonly prisma: PrismaService) {}

  async scanMasterBatch(dto: ScanMasterBatchDto) {
    const masterBatch = await this.prisma.masterBatch.findUnique({
      where: {
        qrId: dto.qrId,
      },
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

        executionBatch: {
          include: {
            mixingExecution: true,

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

    if (!masterBatch) {
      return {
        result: MixingResult.MASTER_BATCH_NOT_FOUND,
      };
    }

    if (masterBatch.status === MasterBatchStatus.CONSUMED) {
      return {
        result: MixingResult.MASTER_BATCH_ALREADY_USED,
      };
    }

    const mixingExecution = masterBatch.executionBatch.mixingExecution;

    if (!mixingExecution) {
      throw new NotFoundException('Mixing execution not found.');
    }

    if (mixingExecution.status === MixingExecutionStatus.COMPLETED) {
      return {
        result: MixingResult.PROCESS_ALREADY_DONE,
      };
    }

    const mixingSteps = masterBatch.recipe.steps.filter(
      (step) => step.stepType === StepType.MIXING
    );

    return {
      result: MixingResult.VALID,

      executionBatchId: masterBatch.executionBatchId,

      recipeName: masterBatch.recipe.recipeCode,

      totalStages: mixingSteps.length,

      writeRecipe: !mixingExecution.recipeWritten,
    };
  }

  async scanIngredient(dto: ScanIngredientDto) {
    return this.prisma.$transaction(async (tx) => {
      const executionIngredient = await tx.executionIngredient.findUnique({
        where: {
          qrId: dto.qrId,
        },
        include: {
          recipeStep: true,

          ingredient: {
            include: {
              bins: true,
            },
          },

          executionBatch: {
            include: {
              mixingExecution: true,

              execution: {
                include: {
                  recipe: {
                    include: {
                      steps: {
                        include: {
                          ingredients: true,
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
                  recipeStep: true,
                  ingredient: true,
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
        return {
          result: MixingResult.WRONG_QR,
        };
      }

      const batch = executionIngredient.executionBatch;

      const mixingExecution = batch.mixingExecution;

      if (!mixingExecution) {
        throw new NotFoundException('Mixing execution not found.');
      }

      if (mixingExecution.status === MixingExecutionStatus.COMPLETED) {
        return {
          result: MixingResult.PROCESS_ALREADY_DONE,
        };
      }

      if (!mixingExecution.recipeWritten) {
        return {
          result: MixingResult.WRONG_BATCH,
        };
      }

      const currentStage = batch.execution.recipe.steps.find(
        (step) =>
          step.stepType === StepType.MIXING &&
          step.sequenceNumber === mixingExecution.currentStageSequence
      );

      if (!currentStage) {
        return {
          result: MixingResult.PROCESS_ALREADY_DONE,
        };
      }

      if (executionIngredient.actualQuantity === null) {
        return {
          result: MixingResult.WEIGH_NOT_DONE,
        };
      }

      if (executionIngredient.status === IngredientExecutionStatus.CONSUMED) {
        return {
          result: MixingResult.PROCESS_ALREADY_DONE,
        };
      }

      if (executionIngredient.mixingScanned) {
        return {
          result: MixingResult.DUPLICATE_SCAN,
        };
      }

      if (executionIngredient.recipeStepId !== currentStage.id) {
        return {
          result: MixingResult.WRONG_STAGE,
        };
      }

      await tx.executionIngredient.update({
        where: {
          id: executionIngredient.id,
        },
        data: {
          mixingScanned: true,
        },
      });

      const currentStageIngredients = batch.ingredients.filter(
        (ingredient) => ingredient.recipeStepId === currentStage.id
      );

      const scannedCount = await tx.executionIngredient.count({
        where: {
          executionBatchId: batch.id,
          recipeStepId: currentStage.id,
          mixingScanned: true,
        },
      });

      const totalIngredients = currentStageIngredients.length;

      const allScanned = scannedCount === totalIngredients;

      const isFirstIngredient = scannedCount === 1;

      const stageTime = currentStage.timerSeconds;

      const currentStageNumber = currentStage.sequenceNumber;

      return {
        result: MixingResult.VALID,

        executionBatchId: batch.id,

        recipeName: batch.execution.recipe.recipeCode,

        currentStageId: currentStage.id,

        currentStage: currentStageNumber,

        stageTime,

        firstIngredient: isFirstIngredient,

        readyToStart: allScanned,

        scanNext: !allScanned,
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
          mixingExecution: true,

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

      if (!batch.mixingExecution) {
        throw new NotFoundException('Mixing execution not found.');
      }

      const mixingExecution = batch.mixingExecution;

      const currentStage = batch.execution.recipe.steps.find(
        (step) =>
          step.stepType === StepType.MIXING &&
          step.sequenceNumber === mixingExecution.currentStageSequence
      );

      if (!currentStage) {
        throw new NotFoundException('Current mixing stage not found.');
      }

      const pendingScans = await tx.executionIngredient.count({
        where: {
          executionBatchId: batch.id,
          recipeStepId: currentStage.id,
          mixingScanned: false,
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
          recipeStepId: currentStage.id,
        },
        data: {
          status: IngredientExecutionStatus.CONSUMED,
          mixingScanned: false,
        },
      });

      const nextStage = batch.execution.recipe.steps.find(
        (step) =>
          step.stepType === StepType.MIXING &&
          step.sequenceNumber === mixingExecution.currentStageSequence + 1
      );

      if (nextStage) {
        await tx.mixingExecution.update({
          where: {
            executionBatchId: batch.id,
          },
          data: {
            currentStageSequence: nextStage.sequenceNumber,
          },
        });

        return {
          success: true,
          stageCompleted: true,
          batchCompleted: false,
          nextStageSequence: nextStage.sequenceNumber,
        };
      }

      return this.finishMixing(tx, batch);
    });
  }

  private async finishMixing(tx: Prisma.TransactionClient, batch: any) {
    await tx.mixingExecution.update({
      where: {
        executionBatchId: batch.id,
      },
      data: {
        status: MixingExecutionStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    await tx.executionBatch.update({
      where: {
        id: batch.id,
      },
      data: {
        mixingStatus: BatchProcessStatus.COMPLETED,
      },
    });

    const qrId = `FB-${batch.execution.executionCode}-B${batch.batchNumber}`;

    const finalBatch = await tx.finalBatch.create({
      data: {
        qrId,

        batchId: batch.id,

        recipeId: batch.execution.recipe.id,
      },
    });

    return {
      success: true,
      stageCompleted: true,
      batchCompleted: true,

      finalBatchId: finalBatch.id,

      qrId: finalBatch.qrId,

      recipeCode: batch.execution.recipe.recipeCode,
    };
  }

  async recipeWritten(executionBatchId: number) {
    await this.prisma.mixingExecution.update({
      where: {
        executionBatchId,
      },
      data: {
        recipeWritten: true,
        status: MixingExecutionStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  }
}
