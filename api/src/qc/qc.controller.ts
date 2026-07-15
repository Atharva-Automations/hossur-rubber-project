import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { QcService } from './qc.service';
import { CreateQcSpecificationDto } from './dto/create-qc-specification.dto';
import { UpdateQcSpecificationDto } from './dto/update-qc-specification.dto';
import { ScanQcDto } from './dto/scan-qc.dto';
import { CreateQcInspectionDto } from './dto/create-qc-inspection.dto';

@Controller('qc')
export class QcController {
  constructor(private readonly qcService: QcService) {}

  @Post('specification')
  createSpecification(@Body() dto: CreateQcSpecificationDto) {
    return this.qcService.createSpecification(dto);
  }

  @Get('specification')
  getAllSpecifications() {
    return this.qcService.findAllSpecifications();
  }

  @Get('specification/:id')
  getSpecification(@Param('id', ParseIntPipe) id: number) {
    return this.qcService.findSpecification(id);
  }

  @Patch('specification/:id')
  updateSpecification(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQcSpecificationDto
  ) {
    return this.qcService.updateSpecification(id, dto);
  }

  @Delete('specification/:id')
  deleteSpecification(@Param('id', ParseIntPipe) id: number) {
    return this.qcService.deleteSpecification(id);
  }

  @Post('scan')
  scanQr(@Body() dto: ScanQcDto) {
    return this.qcService.scanQr(dto);
  }

  @Get('inspection')
  findAllInspections() {
    return this.qcService.findAllInspections();
  }

  @Post('inspection')
  createInspection(@Body() dto: CreateQcInspectionDto) {
    return this.qcService.createInspection(dto);
  }
}
