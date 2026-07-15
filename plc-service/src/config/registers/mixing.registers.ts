export const MIXING_REGISTERS = {
  // -----------------------------
  // Trigger Bits
  // -----------------------------
  SCAN_TRIGGER: 0, // M0

  // -----------------------------
  // Error Bits
  // -----------------------------
  WRONG_QR: 1, // M1

  WRONG_RECIPE: 2, // M2

  WRONG_BATCH: 3, // M3

  WRONG_STAGE: 4, // M4

  PROCESS_ALREADY_DONE: 5, // M5

  READY_TO_START: 6, // M6

  QR_NOT_CORRECT: 7, // M7

  CORRECT_QR: 8, // M8

  STAGE_COMPLETE: 10, // M10

  BATCH_COMPLETE: 11, // M11

  SCAN_NEXT: 12, // M12

  // -----------------------------
  // Data Registers
  // -----------------------------
  QR_START: 350,

  QR_LENGTH: 30,

  RECIPE_START: 20,

  RECIPE_LENGTH: 10,

  TOTAL_STAGES: 416,

  STAGE_TIME: 412,

  CURRENT_STAGE: 44,
};
