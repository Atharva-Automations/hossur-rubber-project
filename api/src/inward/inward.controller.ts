// api/src/inward/inward.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { InwardService } from './inward.service';
import { CreateInwardDto } from './dto/create-inward.dto';
import { UpdateInwardDto } from './dto/update-inward.dto';

@Controller('inward')
export class InwardController {
  constructor(private readonly inwardService: InwardService) {}

  @Post()
  create(@Body() dto: CreateInwardDto) {
    return this.inwardService.create(dto);
  }

  @Get()
  findAll() {
    return this.inwardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inwardService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInwardDto) {
    return this.inwardService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inwardService.remove(id);
  }

  @Get(':id/qrs')
  getQrCodes(@Param('id', ParseIntPipe) id: number) {
    return this.inwardService.getQrCodesByInward(id);
  }
}
