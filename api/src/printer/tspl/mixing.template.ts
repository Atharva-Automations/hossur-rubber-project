import { MixingLabelData } from '../types/mixing-label-data';

export function buildMixingLabel(data: MixingLabelData): string {
  const title = data.labelType === 'MASTER' ? 'MASTER BATCH' : 'FINAL BATCH';

  return `
SIZE 70 mm,35 mm
GAP 2 mm,0
DIRECTION 1
CLS

TEXT 30,20,"0",0,14,14,"${title}"

TEXT 30,60,"0",0,10,10,"Recipe : ${data.recipeCode}"

TEXT 30,90,"0",0,10,10,"Batch : ${data.batchNumber}"

QRCODE 400,20,L,5,A,0,"${data.qrId}"

PRINT 1
`;
}
