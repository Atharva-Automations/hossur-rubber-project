import { Controller, Post, Body } from '@nestjs/common';
import { ProductionService } from './production.service';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post('scan-qr')
  async scanQr(@Body('qrCode') qrId: string) {
    return this.productionService.scanQr(qrId);
  }
}
