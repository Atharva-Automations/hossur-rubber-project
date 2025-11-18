import { BinService } from './bins.service';
import { AssignBinDto } from './dto/assign-bin.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
} from '@nestjs/common';

@Controller('bins')
export class BinController {
  constructor(private readonly binService: BinService) {}

  @Post()
  create(@Body() body: any) {
    return this.binService.assignBin(body);
  }

  @Post('assign')
  async assignBin(@Body() dto: AssignBinDto) {
    return this.binService.assignBin(dto);
  }

  @Get()
  async getAllBins() {
    return this.binService.findAll();
  }

  @Get('available')
  async getAvailableBins() {
    return this.binService.getAvailableBins();
  }

  @Get('unassigned-ingredients')
  async getUnassignedIngredients() {
    return this.binService.getUnassignedIngredients();
  }

  @Get('status')
  async getBinStatus() {
    return this.binService.getBinStatus();
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.binService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.binService.delete(id);
  }
}
