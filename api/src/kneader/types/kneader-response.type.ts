export enum KneaderResult {
  VALID = 'VALID',

  WRONG_SEQUENCE = 'WRONG_SEQUENCE',
  WRONG_RECIPE = 'WRONG_RECIPE',
  WRONG_BATCH = 'WRONG_BATCH',
  WEIGH_NOT_DONE = 'WEIGH_NOT_DONE',
  WRONG_STAGE = 'WRONG_STAGE',
  PROCESS_ALREADY_DONE = 'PROCESS_ALREADY_DONE',
  WRONG_QR = 'WRONG_QR',
  DUPLICATE_SCAN = 'DUPLICATE_SCAN',
}

export interface KneaderResponse {
  result: KneaderResult;

  writeRecipe: boolean;

  recipeCode?: string;

  stageTimings?: number[];

  scanNext: boolean;

  readyToStart: boolean;

  batchComplete: boolean;
}
