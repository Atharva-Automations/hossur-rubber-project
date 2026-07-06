  import {PrinterLabelData} from '../types/printer-label-data';
  
  export function generateTSPL(data: PrinterLabelData): string {
    const lines = [
      'SIZE 100 mm, 50 mm',
      'GAP 2 mm, 0 mm',
      'DIRECTION 0',
      'CLS',
      'BOX 4,4, 770,370, 5',
      'TEXT 100,20,"0",0,18,15,"PREMIER SEALING PRODUCTS"',
      'BAR 4,70,765,5',
      `QRCODE 70,120,M,8,A,0,M2,"${escapeTsplText(data.qrId)}"`,
      `TEXT 90,300,"0",0,9,9,"${escapeTsplText(data.qrId)}"`,
      'BAR 300,70,5,300',
      `TEXT 330,100,"0",0,9,9,"MATERIAL NAME : ${escapeTsplText(
        data.materialName
      )}"`,
      `TEXT 330,140,"0",0,9,9,"SUPPLIER NAME : ${escapeTsplText(
        data.supplierName
      )}"`,
      `TEXT 330,180,"0",0,9,9,"BATCH NO. : ${escapeTsplText(
        data.batchNumber || 'N/A'
      )}"`,
      `TEXT 330,220,"0",0,9,9,"QUANTITY : ${escapeTsplText(
        `${data.quantity} ${data.unit}`
      )}"`,
      `TEXT 330,260,"0",0,9,9,"MFG DATE : ${escapeTsplText(
        data.mfgDate
      )}"`,
      `TEXT 330,300,"0",0,9,9,"EXP DATE : ${escapeTsplText(
        data.expDate
      )}"`,
      `TEXT 700,340,"0",0,7,6,"${escapeTsplText(data.julianDate)}"`,
      'PRINT 1,1',
      '',
    ];

    return lines.join('\r\n');
  }

  export function formatDate(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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