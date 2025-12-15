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
  outwardNumber?: string;
  items: OutwardItem[];
  createdAt?: string;
  updatedAt?: string;
}
