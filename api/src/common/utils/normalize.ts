// src/common/utils/normalize.ts
export const normalizeName = (value: string) =>
  value.trim().replace(/\s+/g, ' ').toLowerCase();

export const canonicalName = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    );
