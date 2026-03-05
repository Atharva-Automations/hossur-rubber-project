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

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: 'asc' | 'desc'
  ) {
    if (search || status || sort) {
      return this.inwardService.findAllFiltered(search, status, sort);
    }
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

  @Get('available-bags/:material')
  async getAvailableBags(@Param('material') material: string) {
    return this.inwardService.getAvailableBags(material);
  }

  @Get('available-bags-by-inward/:inwardId')
  async getAvailableBagsByInward(
    @Param('inwardId', ParseIntPipe) inwardId: number
  ) {
    return this.inwardService.getAvailableBagsByInward(inwardId);
  }

  @Get('available-for-outward')
  async getAvailableForOutward() {
    return this.inwardService.getAvailableForOutward();
  }

  @Get('qr/:qrId')
  async getQrByQrId(@Param('qrId') qrId: string) {
    console.log('\n========== 📱 QR LOOKUP ENDPOINT HIT ==========');
    console.log('🔍 Controller received QR ID:', qrId);
    console.log('⏱️  Timestamp:', new Date().toISOString());

    try {
      const result = await this.inwardService.getQrByQrId(qrId);
      console.log('✅ Service returned result');
      return result;
    } catch (error: any) {
      console.error('❌ Controller error:', error.message);
      throw error;
    }
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
