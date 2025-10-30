// src/hooks/useMaterialStock.ts

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useMaterialStock() {
  return useQuery<MaterialStock[], Error>({
    queryKey: ['materialStock'],
    queryFn: async () => {
      const res = await api.get('/inward/stock'); // API endpoint to fetch material stock
      return res.data;
    },
  });
}

export type MaterialStock = {
  id: number;
  materialName: string;
  totalQuantity: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
};
