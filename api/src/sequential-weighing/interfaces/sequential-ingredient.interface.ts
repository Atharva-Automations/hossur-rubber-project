export interface SequentialIngredient {
  recipeIngredientId: string;

  ingredientId: string;
  ingredientCode: string;
  ingredientName: string;

  targetWeight: number;
  tolerance: number;

  plcIngredientIndex: number;

  weighingScaleNo: number;

  binNumber: number;
}