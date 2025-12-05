import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  ParseIntPipe,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { WeighDto } from './dto/weigh.dto';
import { BatchService } from './batch.service';
import { BulkScanDto } from './dto/bulk-scan.dto';
import { BulkWeighDto } from './dto/bulk-weigh.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import {
  StartStepDto,
  ScanExecutionDto,
  CompleteStepDto,
  FinalizeProductDto,
} from './dto/execution-step.dto';

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

  @Post(':id/start')
  async start(@Param('id', ParseIntPipe) id: number) {
    return this.service.startExecution(id);
  }

  @Get(':id/weighing/next')
  async getNextWeighingItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getNextWeighingItem(id);
  }

  @Get(':id/weighing/list')
  async listWeighed(@Param('id', ParseIntPipe) id: number) {
    return this.service.getWeighedList(id);
  }

  @Post(':id/weigh')
  async weigh(@Param('id', ParseIntPipe) id: number, @Body() dto: WeighDto) {
    return this.service.weighIngredient(id, dto);
  }

  // --- BULK MODE ---

  @Post(':id/bulk/start')
  async startBulk(@Param('id', ParseIntPipe) id: number) {
    return this.service.startBulkWeighing(id);
  }

  @Get(':id/bulk/labels')
  async bulkLabels(@Param('id', ParseIntPipe) id: number) {
    return this.service.getBulkLabelList(id);
  }

  @Post(':id/bulk/scan')
  async bulkScan(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BulkScanDto
  ) {
    return this.service.scanBulkQr(id, dto.qrId);
  }

  @Post(':id/bulk/weigh')
  async bulkWeigh(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BulkWeighDto
  ) {
    return this.service.weighBulkIngredient(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  // EXECUTION ROUTES

  @Post(':id/execution/start-step')
  async startStep(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StartStepDto
  ) {
    return this.service.startExecutionStep(id, dto);
  }

  @Post(':id/execution/scan')
  async scanExecution(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ScanExecutionDto
  ) {
    return this.service.scanExecutionQr(id, dto);
  }

  @Post(':id/execution/complete-step')
  async completeStep(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteStepDto
  ) {
    return this.service.completeExecutionStep(id, dto);
  }

  @Post(':id/execution/finalize-product')
  async finalizeProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: FinalizeProductDto
  ) {
    return this.service.finalizeProductExecution(id, dto);
  }

  @Get(':id/execution/status')
  async executionStatus(@Param('id', ParseIntPipe) id: number) {
    return this.service.getExecutionStatus(id);
  }

  @Post(':id/start-execution')
  startExecution(@Param('id') id: number) {
    return this.service.startExecutionPhase(id);
  }

  @Post(':id/product-execution/:productExecutionId/start')
  async startProductExecution(
    @Param('id', ParseIntPipe) batchId: number,
    @Param('productExecutionId', ParseIntPipe) productExecutionId: number
  ) {
    return this.service.startProductExecution(batchId, productExecutionId);
  }

  @Get(':id/product-execution/:productExecutionId/active-step')
  async getActiveStepForProduct(
    @Param('id', ParseIntPipe) batchId: number,
    @Param('productExecutionId', ParseIntPipe) productExecutionId: number
  ) {
    return this.service.getActiveExecutionStep(batchId, productExecutionId);
  }

  @Get(':batchId/execution/active-step')
  async getActiveExecutionStep(
    @Param('batchId') batchId: number,
    @Query('productExecutionId') productExecutionId: number
  ) {
    return this.service.getActiveExecutionStep(batchId, productExecutionId);
  }

  @Post(
    ':batchId/product-execution/:productExecutionId/steps/:batchStepId/start'
  )
  async startStepNew(
    @Param('batchId', ParseIntPipe) batchId: number,
    @Param('productExecutionId', ParseIntPipe) productExecutionId: number,
    @Param('batchStepId', ParseIntPipe) batchStepId: number
  ) {
    return this.service.startExecutionStep(batchId, {
      productExecutionId,
      batchStepId,
    });
  }

  @Get(':id/product/:productExecutionId/qr')
  async getProductQr(
    @Param('id') batchId: number,
    @Param('productExecutionId') productExecutionId: number
  ) {
    return this.service.getFinalizedProductQr(batchId, productExecutionId);
  }

  @Post(':id/finalize-batch')
  async finalizeBatch(@Param('id', ParseIntPipe) id: number) {
    return this.service.finalizeBatch(id);
  }

  @Get(':id/qr')
  async getBatchQr(@Param('id', ParseIntPipe) id: number) {
    return this.service.getBatchQr(id);
  }
}
