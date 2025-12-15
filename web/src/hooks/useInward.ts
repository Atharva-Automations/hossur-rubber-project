'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Types
import type {
  Inward,
  InwardFilters,
  CreateInwardPayload,
  UpdateInwardPayload,
} from '@/types/inward';

// Notifications
import {
  notifyInwardCreated,
  notifyInwardUpdated,
  notifyInwardDeleted,
  notifyInwardActionFailed,
} from '@/utils/notifications';

// ------------------------------------
// QUERY KEYS
// ------------------------------------
export const INWARD_QUERY_KEYS = {
  all: ['inward'] as const,
  list: (filters?: InwardFilters) => ['inward', 'list', filters] as const,
  analytics: ['inward', 'analytics'] as const,
  detail: (id: number) => ['inward', 'detail', id] as const,
};

// ------------------------------------
// FETCH INWARD LIST
// ------------------------------------
export function useInwardData(filters?: InwardFilters) {
  return useQuery<Inward[]>({
    queryKey: INWARD_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.search) params.append('search', filters.search);
      if (filters?.status && filters.status !== 'All')
        params.append('status', filters.status);
      if (filters?.sort) params.append('sort', filters.sort);

      const res = await api.get(`/inward?${params.toString()}`);
      return res.data;
    },
  });
}

// ------------------------------------
// ANALYTICS API
// ------------------------------------
export interface InwardAnalyticsData {
  totalMaterials: number;
  active: number;
  expired: number;
  topSuppliers: { supplier: string; qty: number }[];
}

export function useInwardAnalytics() {
  return useQuery<InwardAnalyticsData>({
    queryKey: INWARD_QUERY_KEYS.analytics,
    queryFn: async () => {
      const res = await api.get('/inward/analytics');
      return res.data;
    },
  });
}

// ------------------------------------
// CREATE INWARD
// ------------------------------------
export function useCreateInward() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateInwardPayload) => {
      const res = await api.post('/inward', payload);
      return res;
    },

    onSuccess: () => {
      notifyInwardCreated();
      qc.invalidateQueries({ queryKey: INWARD_QUERY_KEYS.all });
    },

    onError: () => {
      notifyInwardActionFailed();
    },
  });
}

// ------------------------------------
// UPDATE INWARD
// ------------------------------------
export function useUpdateInward(id: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateInwardPayload) => {
      const res = await api.patch(`/inward/${id}`, payload);
      return res;
    },

    onSuccess: () => {
      notifyInwardUpdated();
      qc.invalidateQueries({ queryKey: INWARD_QUERY_KEYS.all });
    },

    onError: () => {
      notifyInwardActionFailed();
    },
  });
}

// ------------------------------------
// DELETE INWARD
// ------------------------------------
export function useDeleteInward() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/inward/${id}`);
      return res;
    },

    onSuccess: () => {
      notifyInwardDeleted();
      qc.invalidateQueries({ queryKey: INWARD_QUERY_KEYS.all });
    },

    onError: () => {
      notifyInwardActionFailed();
    },
  });
}
