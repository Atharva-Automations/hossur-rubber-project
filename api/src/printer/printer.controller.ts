import { Controller, Post, Get, Body } from '@nestjs/common';
import { PrinterService } from './printer.service';

@Controller('printer')
export class PrinterController {
  constructor(private readonly printerService: PrinterService) {}

  /**
   * Print single QR label
   */
  @Post('print')
  async printLabel(@Body() body: { qrId: string }) {
    await this.printerService.printLabel(body.qrId);
    return { success: true, message: 'Label printed successfully' };
  }

  /**
   * Print multiple QR labels one by one
   */
  @Post('print-batch')
  async printBatch(@Body() body: { qrCodes: Array<{ qrId: string }> }) {
    await this.printerService.printBatch(body.qrCodes);
    return {
      success: true,
      message: `${body.qrCodes.length} labels printed successfully`,
    };
  }

  /**
   * Test printer connection
   */
  @Get('test')
  async testPrinter() {
    const connected = await this.printerService.testConnection();
    return { connected };
  }

  /**
   * Get printer status
   */
  @Get('status')
  async getStatus() {
    return this.printerService.getStatus();
  }

  /**
   * Get network printer info
   */
  @Get('network-info')
  async getNetworkInfo() {
    const info = await this.printerService.getNetworkInfo();
    return { info };
  }
}
