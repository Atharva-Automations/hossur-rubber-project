// src/batch/batch.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  ParseIntPipe,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { BatchService } from './batch.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
// import { WeighDto } from './dto/weigh.dto';
// import { ScanDto } from './dto/scan.dto';

@Controller('batch')
export class BatchController {
  constructor(private readonly service: BatchService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const b = await this.service.findOne(id);
    if (!b) throw new NotFoundException();
    return b;
  }

  @Post()
  async create(@Body() dto: CreateBatchDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBatchDto
  ) {
    return this.service.updateBatch(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
