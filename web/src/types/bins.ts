export type BinStatus = 'EMPTY' | 'ACTIVE' | 'INACTIVE';

export interface BinIngredient {
  id?: number;
  name?: string;
  ingredientCode?: string;
  type?: string;
}

export interface Bin {
  binNumber: string;
  minQuantity?: number;
  maxQuantity?: number;
  currentQuantity?: number;
  status?: BinStatus;
  ingredient?: BinIngredient | null;
  createdAt?: string;
  updatedAt?: string;
}
