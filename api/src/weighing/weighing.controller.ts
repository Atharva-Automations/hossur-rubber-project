import { Body, Controller, Post, Get } from '@nestjs/common';
import { ScanQrDto } from '../weighing/dto/scan-qr.dto';
import { WeighingService } from './weighing.service';
import { CompleteWeighingDto } from './dto/complete-weighing.dto';

@Controller('weighing')
export class WeighingController {
  constructor(private readonly weighingService: WeighingService) {}

  @Post('scan')
  scan(@Body() dto: ScanQrDto) {
    return this.weighingService.scan(dto);
  }

  @Post('complete')
  complete(@Body() dto: CompleteWeighingDto) {
    return this.weighingService.complete(dto);
  }

  @Get('executions')
  findAllExecutions() {
    return this.weighingService.findAllExecutions();
  }
}
