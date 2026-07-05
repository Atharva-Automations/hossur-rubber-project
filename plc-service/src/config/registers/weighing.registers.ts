export const WEIGHING_REGISTERS = {
  D_OFFSET: 4096,
  M_OFFSET: 2048,

  RECIPE_NAME_START: 20,
  RECIPE_NAME_LENGTH: 10,

  INGREDIENT_COUNT: 40,

  INGREDIENT_CODE_START: 50,
  INGREDIENT_CODE_LENGTH: 10,

  WEIGHT_START: 410,
  WEIGHT_STEP: 2,

  TOLERANCE_START: 476,
  TOLERANCE_STEP: 2,

  CURRENT_INGREDIENT: 578,

  WEIGHING_MACHINE: 580,

  ACTUAL_WEIGHT: 634,

  WEIGHING_DONE_BIT: 3,

  BIN_UNLOADING: {
    1: 543,
    2: 542,
    3: 547,
    4: 546,
    5: 551,
    6: 550,
    7: 555,
    8: 554,
    9: 564,
    10: 563,
    11: 568,
    12: 567,
    13: 572,
    14: 571,
    15: 587,
    16: 586,
    17: 591,
    18: 590,
    19: 595,
    20: 594,
    21: 599,
    22: 598,
    23: 603,
    24: 602,
    25: 607,
    26: 606,
    27: 611,
    28: 610,
    29: 557,
    30: 559,
    31: 574,
  } as Record<number, number>,
};
