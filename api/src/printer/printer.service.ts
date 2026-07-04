import { Injectable } from '@nestjs/common';
import * as net from 'net';
import { PrismaService } from '../prisma/prisma.service';

interface PrinterLabelData {
  qrId: string;
  materialName: string;
  supplierName: string;
  batchNumber?: string | null;
  quantity: number;
  unit: string;
  mfgDate: string;
  expDate: string;
  julianDate: string;
}

@Injectable()
export class PrinterService {
  private printerIP = '192.168.1.75';
  private printerPort = 9100;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Print single label with QR code and ID
   */
  async printLabel(qrId: string): Promise<void> {
    const labelData = await this.getLabelData(qrId);
    const tspl = this.generateTSPL(labelData);
    await this.sendToPrinter(tspl);
  }

  /**
   * Print multiple labels one by one
   */
  async printBatch(qrCodes: Array<{ qrId: string }>): Promise<void> {
    for (const qr of qrCodes) {
      await this.printLabel(qr.qrId);
      // Small delay between prints
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  private async getLabelData(qrId: string): Promise<PrinterLabelData> {
    const qr = await this.prisma.inwardQrCode.findUnique({
      where: { qrId },
      select: {
        qrId: true,
        inward: {
          select: {
            materialName: true,
            supplierName: true,
            batchNumber: true,
            quantity: true,
            unit: true,
            mfgDate: true,
            expDate: true,
          },
        },
      },
    });

    if (!qr?.inward) {
      throw new Error(`No inward record found for QR ${qrId}`);
    }

    return {
      qrId,
      materialName: qr.inward.materialName,
      supplierName: qr.inward.supplierName,
      batchNumber: qr.inward.batchNumber,
      quantity: qr.inward.quantity,
      unit: qr.inward.unit,
      mfgDate: this.formatDate(qr.inward.mfgDate),
      expDate: this.formatDate(qr.inward.expDate),
      julianDate: this.getJulianDate(new Date()),
    };
  }

  /**
   * Generate TSPL command for single label
   */
  private generateTSPL(data: PrinterLabelData): string {
    const lines = [
      'SIZE 100 mm, 50 mm',
      'GAP 2 mm, 0 mm',
      'DIRECTION 0',
      'CLS',
      'BOX 4,4, 770,370, 5',
      'TEXT 100,20,"0",0,18,15,"PREMIER SEALING PRODUCTS"',
      'BAR 4,70,765,5',
      `QRCODE 70,120,M,8,A,0,M2,"${this.escapeTsplText(data.qrId)}"`,
      `TEXT 90,300,"0",0,9,9,"${this.escapeTsplText(data.qrId)}"`,
      'BAR 300,70,5,300',
      `TEXT 330,100,"0",0,9,9,"MATERIAL NAME : ${this.escapeTsplText(
        data.materialName
      )}"`,
      `TEXT 330,140,"0",0,9,9,"SUPPLIER NAME : ${this.escapeTsplText(
        data.supplierName
      )}"`,
      `TEXT 330,180,"0",0,9,9,"BATCH NO. : ${this.escapeTsplText(
        data.batchNumber || 'N/A'
      )}"`,
      `TEXT 330,220,"0",0,9,9,"QUANTITY : ${this.escapeTsplText(
        `${data.quantity} ${data.unit}`
      )}"`,
      `TEXT 330,260,"0",0,9,9,"MFG DATE : ${this.escapeTsplText(
        data.mfgDate
      )}"`,
      `TEXT 330,300,"0",0,9,9,"EXP DATE : ${this.escapeTsplText(
        data.expDate
      )}"`,
      `TEXT 700,340,"0",0,7,6,"${this.escapeTsplText(data.julianDate)}"`,
      'PRINT 1,1',
      '',
    ];

    return lines.join('\r\n');
  }

  private formatDate(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private getJulianDate(date: Date): string {
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return `${String(date.getUTCFullYear()).slice(-2)}${String(
      dayOfYear
    ).padStart(3, '0')}`;
  }

  private escapeTsplText(value: string): string {
    return String(value ?? '').replace(/"/g, "'");
  }

  /**
   * Send TSPL to printer using network socket
   */
  private async sendToPrinter(tspl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`Connecting to ${this.printerIP}:${this.printerPort}...`);

      const client = new net.Socket();
      const timeout = setTimeout(() => {
        client.destroy();
        reject(new Error('Connection timeout'));
      }, 5000);

      client.connect(this.printerPort, this.printerIP, () => {
        clearTimeout(timeout);
        console.log('Connected! Sending TSPL...');
        console.log('---TSPL---');
        console.log(tspl);
        console.log('----------');

        client.write(tspl, 'ascii', (err?: Error | null) => {
          if (err) {
            client.destroy();
            reject(err);
          } else {
            client.end();
          }
        });
      });

      client.on('data', (data: Buffer) => {
        console.log('Printer response:', data.toString());
        // Connection will be closed after write
      });

      client.on('end', () => {
        console.log('✅ Print job sent successfully!');
        resolve();
      });

      client.on('error', (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  // ...existing code...

  /**
   * Test network connection to printer
   */
  private async testNetworkConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      const client = new net.Socket();
      const timeout = setTimeout(() => {
        client.destroy();
        resolve(false);
      }, 3000);

      client.connect(this.printerPort, this.printerIP, () => {
        clearTimeout(timeout);
        client.end();
        resolve(true);
      });

      client.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  /**
   * Test printer connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log(
        `Testing connection to ${this.printerIP}:${this.printerPort}...`
      );

      // Send a simple test print
      const testTSPL = [
        'SIZE 100 mm, 50 mm',
        'CLS',
        'TEXT 100,100,"3",0,1,1,"CONNECTION TEST"',
        'TEXT 100,150,"3",0,1,1,"' + new Date().toLocaleTimeString() + '"',
        'PRINT 1',
        '',
      ].join('\r\n');

      await this.sendToPrinter(testTSPL);
      console.log('Test print sent successfully');
      return true;
    } catch (error) {
      console.error('Printer test failed:', error);
      return false;
    }
  }

  /**
   * Get printer status
   */
  async getStatus(): Promise<{
    connected: boolean;
    ready: boolean;
    error?: string;
    networkInfo?: { ip: string; port: number };
  }> {
    try {
      // Test network connection
      const isConnected = await this.testNetworkConnection();

      return {
        connected: isConnected,
        ready: isConnected,
        networkInfo: { ip: this.printerIP, port: this.printerPort },
      };
    } catch (error) {
      return {
        connected: false,
        ready: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        networkInfo: { ip: this.printerIP, port: this.printerPort },
      };
    }
  }

  /**
   * Get network printer info
   */
  async getNetworkInfo(): Promise<{ ip: string; port: number }> {
    return { ip: this.printerIP, port: this.printerPort };
  }
}
