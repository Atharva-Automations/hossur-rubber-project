import { Controller, Post, Get, Body } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { WeighingPrinterService } from './services/weighing-printer.service';

@Controller('printer')
export class PrinterController {
  constructor(
    private readonly printerService: PrinterService,
    private readonly weighingPrinterService: WeighingPrinterService
  ) {}

  @Post('print')
  async printLabel(@Body() body: { qrId: string }) {
    await this.printerService.printLabel(body.qrId);
    return { success: true, message: 'Label printed successfully' };
  }

  @Post('print-batch')
  async printBatch(@Body() body: { qrCodes: Array<{ qrId: string }> }) {
    await this.printerService.printBatch(body.qrCodes);
    return {
      success: true,
      message: `${body.qrCodes.length} labels printed successfully`,
    };
  }

  @Post('weighing/print')
  async printWeighing(@Body() body: { qrId: string }) {
    await this.weighingPrinterService.printLabel(body.qrId);

    return {
      success: true,
    };
  }

  @Post('weighing/print-batch')
  async printWeighingBatch(@Body() body: { qrCodes: Array<{ qrId: string }> }) {
    await this.weighingPrinterService.printBatch(body.qrCodes);

    return {
      success: true,
    };
  }

  @Get('test')
  async testPrinter() {
    const connected = await this.printerService.testConnection();
    return { connected };
  }

  @Get('status')
  async getStatus() {
    return this.printerService.getStatus();
  }

  @Get('network-info')
  async getNetworkInfo() {
    const info = await this.printerService.getNetworkInfo();
    return { info };
  }
}
