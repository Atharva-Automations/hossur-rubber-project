interface WeighingLabelData {
  qrId: string;
  executionCode: string;
  batchNumber: number;
  ingredientCode: string;
  quantity: number;
  tolerance: number;
}

export function generateWeighingTSPL(data: WeighingLabelData): string {
  return [
    'SIZE 100 mm, 50 mm',
    'GAP 2 mm, 0 mm',
    'DIRECTION 0',
    'CLS',

    `QRCODE 40,30,M,6,A,0,M2,"${escapeTsplText(data.qrId)}"`,

    `TEXT 40,210,"0",0,8,8,"${escapeTsplText(data.qrId)}"`,

    'PRINT 1,1',
    '',
  ].join('\r\n');
}

function escapeTsplText(value: string): string {
  return String(value ?? '').replace(/"/g, "'");
}
