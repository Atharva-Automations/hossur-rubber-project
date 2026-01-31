export type OutwardStatus = 'Completed' | 'Pending';

export interface OutwardItem {
  id: number;
  outwardNumber?: string;
  quantity: number;
  recipient?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Outward {
  id: number;
  materialName: string;
  outwardNumber?: string;
  qrScanStatus?: { scannedBags: number; totalBags?: number };
  quantity?: number;
  status?: OutwardStatus;
  items: OutwardItem[];
  createdAt?: string;
  updatedAt?: string;
}

export type OutwardSortOrder = 'asc' | 'desc';

export interface OutwardFilters {
  search?: string;
  status?: 'All' | OutwardStatus;
  sort?: OutwardSortOrder;
}
