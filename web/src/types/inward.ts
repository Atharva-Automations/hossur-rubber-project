// src/types/inward.ts

export type UnitType = 'KG' | 'L';

export type InwardStatus = 'Active' | 'Expired';

export interface Inward {
  id: number;
  materialName: string;
  supplierName: string;
  quantity: number;
  unit: 'KG' | 'L';
  bagWeight?: number | null;
  storedAsWhole: boolean;
  mfgDate: string;
  expDate: string;
  status: 'Active' | 'Expired';
  createdAt: string;
  updatedAt?: string;
  qrCodes?: Array<{ id: number; code: string }>;
}

export interface CreateInwardPayload {
  materialName: string;
  supplierName: string;
  quantity: number;
  unit: UnitType;
  mfgDate: string; // ISO date or yyyy-mm-dd
  expDate: string;
  bagWeight?: number; // 🔹 make optional
  storedAsWhole?: boolean; // 🔹 optional, backend defaults false if missing
  status?: string; // matches DTO but usually set by backend
}

export type UpdateInwardPayload = Partial<CreateInwardPayload>;

export type InwardSortOrder = 'asc' | 'desc';

export interface InwardFilters {
  search?: string;
  status?: 'All' | InwardStatus;
  sort?: InwardSortOrder;
}
