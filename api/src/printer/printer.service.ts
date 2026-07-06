import { Injectable } from '@nestjs/common';
import { PrinterStatusService } from './services/printer-status.service';
import { InwardPrinterService } from './services/inward-printer.service';

@Injectable()
export class PrinterService {
  private printerIP = '192.168.1.75';
  private printerPort = 9100;

  constructor(
    private readonly inwardPrinterService: InwardPrinterService,
    private readonly printerStatusService: PrinterStatusService
  ) {}

  printLabel(qrId: string) {
    return this.inwardPrinterService.printLabel(qrId);
  }

  printBatch(qrCodes: { qrId: string }[]) {
    return this.inwardPrinterService.printBatch(qrCodes);
  }

  testConnection() {
    return this.printerStatusService.testConnection();
  }

  getStatus() {
    return this.printerStatusService.getStatus();
  }

  getNetworkInfo() {
    return this.printerStatusService.getNetworkInfo();
  }
}
