import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useMaterialStock() {
  return useQuery<MaterialStock[], Error>({
    queryKey: ['materialStock'],
    queryFn: async () => {
      console.log('Fetching material stock');
      const res = await api.get('/inward/stock');
      console.log('Material stock response:', res.data);
      return res.data;
    },
  });
}

export function useAvailableForOutward() {
  return useQuery<InwardEntryForOutward[], Error>({
    queryKey: ['availableForOutward'],
    queryFn: async () => {
      console.log('Fetching available inward entries for outward');
      const res = await api.get('/inward/available-for-outward');
      console.log('Available for outward response:', res.data);
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

export type InwardEntryForOutward = {
  id: number;
  materialName: string;
  supplierName: string;
  bagWeight: number | null;
  unit: string;
  quantity: number;
  _count: {
    qrCodes: number;
  };
};
