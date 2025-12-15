export interface SimulationBatchItem {
  id?: number;
  code?: string;
  name?: string;
  perExecution?: number;
  unit?: string;
  totalForBatch?: number;
}

export interface SimulationBatch {
  id: number;
  name?: string;
  batchNumber?: string;
  recipeId?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BatchWeighingItem {
  qrId: string;
  ingredientCode: string;
  ingredientName: string;
  weight: number;
  timestamp?: string;
}
