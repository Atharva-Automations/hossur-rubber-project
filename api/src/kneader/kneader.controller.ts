import { Body, Controller, Post } from '@nestjs/common';
import { KneaderService } from './kneader.service';
import { CompleteStageDto, RecipeWrittenDto, ScanKneaderDto } from './dto/scan-kneader.dto';

@Controller('kneader')
export class KneaderController {
  constructor(private readonly kneaderService: KneaderService) {}

  @Post('scan')
  scan(@Body() dto: ScanKneaderDto) {
    return this.kneaderService.scan(dto);
  }

  @Post('stage-complete')
  completeStage(@Body() dto: CompleteStageDto) {
    return this.kneaderService.completeStage(dto);
  }

  @Post('recipe-written')
  recipeWritten(@Body() dto: RecipeWrittenDto) {
    return this.kneaderService.recipeWritten(dto);
  }
}
