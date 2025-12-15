export interface RecipeIngredient {
  id?: number;
  ingredientId?: number;
  ingredientCode?: string;
  quantity?: number;
  unit?: string;
  name?: string;
  ingredient?: {
    id: number;
    ingredientCode: string;
    name?: string;
    unit?: string;
  };
}

export interface RecipeStep {
  id?: number;
  stepNumber?: number;
  sequenceNumber?: number;
  stepType?: 'KNEADER' | 'MIXING' | string;
  instruction?: string;
  timerSeconds?: number;
  durationSeconds?: number;
  temperature?: number;
  pressure?: number;
  rpm?: number;
  ingredients?: RecipeIngredient[];
}

export interface Recipe {
  id: number;
  name: string;
  recipeCode?: string;
  code?: string;
  steps?: RecipeStep[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRecipePayload {
  name: string;
  steps: Omit<RecipeStep, 'id'>[];
}

export interface BatchCreatePayload {
  recipeId: number;
  quantity: number;
  enableKneader?: boolean;
  enableMixing?: boolean;
}
