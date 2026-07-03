export const PRODUCTION_PLC = {
  host: '192.168.1.5',
  port: 502,
  unitId: 1,
  timeout: 5000,

  offsets: {
    M: 2048,
    D: 4096,
  },
} as const;
