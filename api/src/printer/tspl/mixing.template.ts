import { MixingLabelData } from '../types/mixing-label-data';

export function buildMixingLabel(data: MixingLabelData): string {
  const title = data.labelType === 'MASTER' ? 'MASTER BATCH' : 'FINAL BATCH';

  const lines = [
    'SIZE 100 mm, 50 mm',
    'GAP 2 mm, 0 mm',
    'DIRECTION 0',
    'CLS',

    'BOX 4,4,770,370,5',

    `TEXT 130,20,"0",0,18,15,"${title}"`,

    'BAR 4,70,765,5',

    `QRCODE 70,120,M,8,A,0,M2,"${escapeTsplText(data.qrId)}"`,

    `TEXT 90,300,"0",0,9,9,"${escapeTsplText(data.qrId)}"`,

    'BAR 300,70,5,300',

    `TEXT 330,110,"0",0,10,10,"RECIPE : ${escapeTsplText(data.recipeCode)}"`,

    `TEXT 330,170,"0",0,10,10,"BATCH NO : ${escapeTsplText(
      String(data.batchNumber)
    )}"`,

    `TEXT 330,230,"0",0,10,10,"LABEL TYPE : ${escapeTsplText(title)}"`,

    `TEXT 700,340,"0",0,7,6,"${getJulianDate(new Date())}"`,

    'PRINT 1,1',
    '',
  ];

  return lines.join('\r\n');
}

export function getJulianDate(date: Date): string {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  return `${String(date.getUTCFullYear()).slice(-2)}${String(
    dayOfYear
  ).padStart(3, '0')}`;
}

function escapeTsplText(value: string): string {
  return String(value ?? '').replace(/"/g, "'");
}
