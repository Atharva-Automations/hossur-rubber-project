export function buildPlcPayload(
  executionIngredient: any,
  isFirstScan: boolean
) {
  const batch = executionIngredient.executionBatch;
  const execution = batch.execution;
  const recipe = execution.recipe;

  const allIngredients = batch.ingredients.sort(
    (a: any, b: any) => a.plcIngredientIndex - b.plcIngredientIndex
  );

  const bin = executionIngredient.ingredient.bins?.[0];

  if (!bin) {
    throw new Error(
      `No bin assigned for ingredient ${executionIngredient.ingredient.ingredientCode}`
    );
  }

  const binNumber = bin.binNumber;
  const plcBinNumber = Number(bin.binNumber.replace(/[^\d]/g, ''));

  function getWeighingMachine(binNumber: number): number {
    if (binNumber >= 1 && binNumber <= 28) return 1;

    if (binNumber >= 29 && binNumber <= 31) return 2;

    if (binNumber >= 32 && binNumber <= 34) return 3;

    if (binNumber >= 35) return 4;

    throw new Error(`Invalid bin number ${binNumber}`);
  }

  return {
    firstScan: isFirstScan,

    recipe: isFirstScan
      ? {
          recipeName: recipe.name,
          ingredientCount: allIngredients.length,
          ingredients: allIngredients.map(
            (item: {
              plcIngredientIndex: any;
              ingredient: { ingredientCode: any };
              quantity: any;
              tolerance: any;
            }) => ({
              ingredientNumber: item.plcIngredientIndex,
              ingredientCode: item.ingredient.ingredientCode,
              quantity: item.quantity,
              tolerance: item.tolerance,
            })
          ),
        }
      : null,

    currentIngredient: {
      qrId: executionIngredient.qrId,
      ingredientNumber: executionIngredient.plcIngredientIndex,
      ingredientCode: executionIngredient.ingredient.ingredientCode,
      quantity: executionIngredient.quantity,
      tolerance: executionIngredient.tolerance,
      binNumber: plcBinNumber,
      weighingMachine: getWeighingMachine(plcBinNumber),
    },
  };
}
