import { Body, Controller, Post } from '@nestjs/common';
import { SequentialWeighingService } from './sequential-weighing.service';

@Controller('sequential-weighing')
export class SequentialWeighingController {
  constructor(private readonly service: SequentialWeighingService) {}

  @Post('test')
  test(@Body() body: { recipeCode: string }) {
    return this.service.start(body.recipeCode);
  }
}
