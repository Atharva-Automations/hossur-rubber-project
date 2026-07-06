interface WeighingLabelData {
  qrId: string;

  recipeCode: string;
  executionCode: string;
  batchNumber: number;

  ingredientCode: string;
  binNumber: string;

  quantity: number;

  tolerance: number;

  julianDate: string;

  mode: 'BULK' | 'SEQUENTIAL';
}

export function generateWeighingTSPL(data: WeighingLabelData): string {
  const heading =
    data.mode === 'SEQUENTIAL' ? 'WEIGHING - SEQUENTIAL' : 'WEIGHING - BULK';

  const headingX = data.mode === 'SEQUENTIAL' ? 150 : 210;

  return [
    'SIZE 100 mm, 50 mm',
    'GAP 2 mm, 0 mm',
    'DIRECTION 0',
    'CLS',

    'BOX 4,4,770,370,5',

    `TEXT ${headingX},20,"0",0,18,15,"${heading}"`,

    'BAR 4,70,765,5',

    `QRCODE 60,100,M,8,A,0,M2,"${escapeTsplText(data.qrId)}"`,

    `TEXT 50,310,"0",0,9,9,"${escapeTsplText(data.qrId)}"`,

    'BAR 300,70,5,300',

    `TEXT 330,90,"0",0,9,9,"RECIPE NAME : ${escapeTsplText(data.recipeCode)}"`,

    `TEXT 330,130,"0",0,9,9,"EXECUTION : ${escapeTsplText(
      data.executionCode
    )}"`,

    `TEXT 330,170,"0",0,9,9,"BATCH NO. : ${data.batchNumber}"`,

    `TEXT 330,210,"0",0,9,9,"INGREDIENT : ${escapeTsplText(
      data.ingredientCode
    )}"`,

    `TEXT 330,250,"0",0,9,9,"BIN NO. : ${escapeTsplText(data.binNumber)}"`,

    `TEXT 330,290,"0",0,9,9,"QUANTITY : ${data.quantity} GM"`,

    `TEXT 330,330,"0",0,9,9,"TOLERANCE : ${data.tolerance} %"`,

    `TEXT 700,340,"0",0,7,6,"${escapeTsplText(data.julianDate)}"`,

    'PRINT 1,1',
    '',
  ].join('\r\n');
}

function escapeTsplText(value: string): string {
  return String(value ?? '').replace(/"/g, "'");
}
