import { Injectable } from '@nestjs/common';
import { ProductionService } from '../production/production.service';
import { WeighingService } from '../weighing/weighing.service';

@Injectable()
export class ScannerService {
  constructor(
    private readonly productionService: ProductionService,
    private readonly weighingService: WeighingService
  ) {}

  async scan(qrId: string) {
    if (qrId.startsWith('BW-')) {
      return this.weighingService.scan({ qrId });
    }

    return this.productionService.scanQr(qrId);
  }
}
