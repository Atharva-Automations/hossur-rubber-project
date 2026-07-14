import { Body, Controller, Post } from '@nestjs/common';
import { MixingService } from './mixing.service';
import { ScanMasterBatchDto } from './dto/scan-master-batch.dto';
import { ScanIngredientDto } from './dto/scan-ingredient.dto';
import { CompleteStageDto } from './dto/complete-stage.dto';

@Controller('mixing')
export class MixingController {
  constructor(private readonly mixingService: MixingService) {}

  @Post('scan-master-batch')
  scanMasterBatch(@Body() dto: ScanMasterBatchDto) {
    return this.mixingService.scanMasterBatch(dto);
  }

  @Post('scan-ingredient')
  scanIngredient(@Body() dto: ScanIngredientDto) {
    return this.mixingService.scanIngredient(dto);
  }

  @Post('stage-complete')
  completeStage(@Body() dto: CompleteStageDto) {
    return this.mixingService.completeStage(dto);
  }

  @Post('recipe-written')
  recipeWritten(@Body() dto: CompleteStageDto) {
    return this.mixingService.recipeWritten(dto.executionBatchId);
  }
}
