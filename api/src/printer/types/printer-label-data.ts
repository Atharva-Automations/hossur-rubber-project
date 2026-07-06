export interface PrinterLabelData {
  qrId: string;
  materialName: string;
  supplierName: string;
  batchNumber?: string | null;
  quantity: number;
  unit: string;
  mfgDate: string;
  expDate: string;
  julianDate: string;
}

export interface WeighingLabelData {
  qrId: string;
  recipeCode: string;
  executionCode: string;
  batchNumber: number;
  ingredientCode: string;
  binNumber: string;
  quantity: number;
  tolerance: number;
  julianDate: string;
  mode: 'BULK' | 'SEQUENTIAL';
}
