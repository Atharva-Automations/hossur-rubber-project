export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';

export interface IngredientLine {
  ingredientCode: string;
  quantity: number;
}

export interface RecipeOption {
  id: string;
  name: string;
  ingredients: IngredientLine[];
}

export interface ExecutionItem {
  id: string;
  executionNumber: string;
  recipeName: string;
  batchCount: number;
  status: ExecutionStatus;
}
