export interface InventoryItem {
  id: number;
  name: string;
  code?: string;
  quantity: number;
  unit?: string;
  createdAt?: string;
  updatedAt?: string;
}
