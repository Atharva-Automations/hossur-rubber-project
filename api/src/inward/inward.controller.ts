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
  Query,
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

  // ✅ Combined findAll + filtered route (replaces duplicate)
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: 'asc' | 'desc'
  ) {
    // If any filter is present, use filtered logic
    if (search || status || sort) {
      return this.inwardService.findAllFiltered(search, status, sort);
    }
    // Otherwise, return all
    return this.inwardService.findAll();
  }

  @Get('/stock')
  async getStock() {
    return this.inwardService.getStock();
  }

  @Get('/analytics')
  async getAnalytics() {
    return this.inwardService.getAnalytics();
  }

  @Get('materials')
  async getMaterials() {
    return this.inwardService.getMaterials();
  }

  @Get('suppliers')
  async getSuppliers() {
    return this.inwardService.getSuppliers();
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
