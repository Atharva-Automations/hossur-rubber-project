import { SequentialIngredient } from './sequential-ingredient.interface';

export interface SequentialSession {
  executionId: string;

  batchId: string;

  recipeId: string;
  recipeCode: string;
  recipeName: string;

  ingredients: SequentialIngredient[];

  currentIndex: number;

  active: boolean;
}
