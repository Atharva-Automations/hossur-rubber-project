import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { OutwardService } from './outward.service';
import { CreateOutwardDto } from './dto/create-outward.dto';
import { UpdateOutwardDto } from './dto/update-outward.dto';

@Controller('outward')
export class OutwardController {
  constructor(private readonly outwardService: OutwardService) {}

  @Post()
  create(@Body() dto: CreateOutwardDto) {
    return this.outwardService.create(dto);
  }

  @Get()
  findAll() {
    return this.outwardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.outwardService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOutwardDto) {
    return this.outwardService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.outwardService.remove(id);
  }

  // QR Scan endpoint
  @Post(':id/scan')
  scanQr(@Param('id', ParseIntPipe) id: number, @Body('qrId') qrId: string) {
    return this.outwardService.scanQr(id, qrId);
  }

  // Mark completed
  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.outwardService.complete(id);
  }
}
