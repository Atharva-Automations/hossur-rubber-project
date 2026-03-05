import { Injectable } from '@nestjs/common';
import * as net from 'net';

@Injectable()
export class PrinterService {
  private printerIP = '192.168.1.75';
  private printerPort = 9100;

  /**
   * Print single label with QR code and ID
   */
  async printLabel(qrId: string): Promise<void> {
    const tspl = this.generateTSPL(qrId);
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

  /**
   * Generate TSPL command for single label
   */
  private generateTSPL(qrId: string): string {
    return [
      'SIZE 100 mm, 50 mm',
      'GAP 2 mm, 0 mm',
      'DIRECTION 0',
      'CLS',
      'QRCODE 100,60,H,5,A,0,"' + qrId + '"',
      'TEXT 100,280,"3",0,1,1,"' + qrId + '"',
      'PRINT 1',
      '',
    ].join('\r\n');
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
