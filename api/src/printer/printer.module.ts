import { Module } from '@nestjs/common';
import { PrinterController } from './printer.controller';
import { PrinterService } from './printer.service';
import { TscPrinterClient } from './transport/tsc-printer.client';
import { PrinterStatusService } from './services/printer-status.service';
import { InwardPrinterService } from './services/inward-printer.service';
import { WeighingPrinterService } from './services/weighing-printer.service';
import { MixingPrinterService } from './services/mixing-printer.service';
import { QcPrinterService } from './services/qc-printer.service';

@Module({
  controllers: [PrinterController],
  providers: [
    PrinterService,
    WeighingPrinterService,
    InwardPrinterService,
    PrinterStatusService,
    TscPrinterClient,
    MixingPrinterService,
    QcPrinterService,
  ],
  exports: [PrinterService], // Export so other modules can use it
})
export class PrinterModule {}
