import { generateBulkQrId } from '../../common/utils/code-generator';
import { IngredientExecutionStatus } from '@prisma/client';

export function buildExecutionIngredients(
  recipe: any,
  execution: any,
  batches: any[]
) {
  const rows: any[] = [];

  for (const batch of batches) {
    let plcIngredientIndex = 1;

    for (const step of recipe.steps) {
      for (const ingredient of step.ingredients) {
        rows.push({
          executionBatchId: batch.id,

          recipeStepId: step.id,

          stepIngredientId: ingredient.id,

          ingredientId: ingredient.ingredientId,

          qrId: generateBulkQrId(
            execution.executionCode,
            batch.batchNumber,
            plcIngredientIndex
          ),

          plcIngredientIndex,

          quantity: ingredient.quantity,

          tolerance: ingredient.tolerance,

          status: IngredientExecutionStatus.PENDING,
        });
        plcIngredientIndex++;
      }
    }
  }

  return rows;
}
