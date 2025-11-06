import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { OutwardService } from './outward.service';
import { CreateOutwardDto } from './dto/create-outward.dto';

@Controller('outward')
export class OutwardController {
  constructor(private readonly outwardService: OutwardService) {}

  @Post()
  create(@Body() data: CreateOutwardDto) {
    return this.outwardService.create(data);
  }

  @Get()
  findAll() {
    return this.outwardService.findAll();
  }

  @Get('/analytics')
  async getAnalytics() {
    return this.outwardService.getAnalytics();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.outwardService.findOne(id);
  }

  @Post('scan-qr')
  async scanQr(@Body() body: { outwardId: number; qrId: string }) {
    return this.outwardService.scanQr(body.outwardId, body.qrId);
  }
}
