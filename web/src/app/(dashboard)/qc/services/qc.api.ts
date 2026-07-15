import api from '@/lib/api';

export interface QcSpecification {
  id: number;
  recipeId: number;
  hardness?: number;
  tensile?: number;
  elongation?: number;
  specificGravity?: number;
  compressionSet?: number;
  recipe: {
    id: number;
    recipeCode: string;
    name: string;
  };
}

export interface QcSpecificationPayload {
  recipeId: number;
  hardness?: number;
  tensile?: number;
  elongation?: number;
  specificGravity?: number;
  compressionSet?: number;
}

export interface ScanQcResponse {
  finalBatchId: number;
  qrId: string;
  recipe?: {
    id: number;
    recipeCode: string;
    name: string;
  };
  batch?: {
    batchNumber?: number;
    [key: string]: unknown;
  };
  specification: {
    hardness?: number;
    tensile?: number;
    elongation?: number;
    specificGravity?: number;
    compressionSet?: number;
  };
}

export interface InspectionPayload {
  finalBatchId: number;
  hardnessActual?: number;
  tensileActual?: number;
  elongationActual?: number;
  specificGravityActual?: number;
  compressionSetActual?: number;
  remarks?: string;
}

export interface QcInspectionHistoryItem {
  id: number;
  status: 'PASS' | 'FAIL';
  finalBatch: {
    qrId: string;
    recipe: {
      recipeCode: string;
    };
    executionBatch: {
      batchNumber: number;
      execution: {
        executionCode: string;
      };
    };
  };
}

export const qcApi = {
  getSpecifications: () => api.get<QcSpecification[]>('/qc/specification'),

  createSpecification: (data: QcSpecificationPayload) =>
    api.post('/qc/specification', data),

  updateSpecification: (id: number, data: QcSpecificationPayload) =>
    api.patch(`/qc/specification/${id}`, data),

  deleteSpecification: (id: number) => api.delete(`/qc/specification/${id}`),

  scanQr: (qrId: string) => api.post<ScanQcResponse>('/qc/scan', { qrId }),

  createInspection: (data: InspectionPayload) =>
    api.post('/qc/inspection', data),

  getInspections: () => api.get<QcInspectionHistoryItem[]>('/qc/inspection'),

  printQrLabel: (qrId: string) => api.post('/printer/print', { qrId }),

  printQcLabel: (data: {
    qrId: string;
    recipeCode: string;
    batchNumber: number;
    qcResult: 'PASS' | 'FAIL';
  }) => api.post('/printer/qc/print', data),
};
