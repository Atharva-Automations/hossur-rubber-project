import { Injectable } from '@nestjs/common';
import { TscPrinterClient } from '../transport/tsc-printer.client';
import { PRINTERS } from '../config/printer.config';

@Injectable()
export class PrinterStatusService {
  constructor(private readonly tscPrinterClient: TscPrinterClient) {}

  async testConnection(): Promise<boolean> {
    try {
      const printer = PRINTERS.inward;
      console.log(`Testing connection to ${printer.ip}:${printer.port}...`);

      // Send a simple test print
      const testTSPL = [
        'SIZE 100 mm, 50 mm',
        'CLS',
        'TEXT 100,100,"3",0,1,1,"CONNECTION TEST"',
        'TEXT 100,150,"3",0,1,1,"' + new Date().toLocaleTimeString() + '"',
        'PRINT 1',
        '',
      ].join('\r\n');

      await this.tscPrinterClient.send(printer.ip, printer.port, testTSPL);
      console.log('Test print sent successfully');
      return true;
    } catch (error) {
      console.error('Printer test failed:', error);
      return false;
    }
  }

  async getStatus(): Promise<{
    connected: boolean;
    ready: boolean;
    error?: string;
    networkInfo?: { ip: string; port: number };
  }> {
    const printer = PRINTERS.inward;
    try {
      // Test network connection

      const isConnected = await this.tscPrinterClient.testNetworkConnection(
        printer.ip,
        printer.port
      );

      return {
        connected: isConnected,
        ready: isConnected,
        networkInfo: { ip: printer.ip, port: printer.port },
      };
    } catch (error) {
      return {
        connected: false,
        ready: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        networkInfo: { ip: printer.ip, port: printer.port },
      };
    }
  }

  async getNetworkInfo(): Promise<{ ip: string; port: number }> {
    const printer = PRINTERS.inward;

    return printer;
  }
}
