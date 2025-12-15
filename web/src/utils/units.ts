// src/utils/units.ts

import type { UnitType } from '@/types/inward';

export const BASE_MASS_UNIT: UnitType = 'KG';
export const BASE_VOLUME_UNIT: UnitType = 'L';

export function parseNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return NaN;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Currently we only support base units KG and L.
 * When we introduce GM/ML on UI, we will add conversion helpers here.
 */
export function normalizeUnit(unit: UnitType | undefined | null): UnitType {
  if (unit === 'L') return 'L';
  return 'KG';
}
