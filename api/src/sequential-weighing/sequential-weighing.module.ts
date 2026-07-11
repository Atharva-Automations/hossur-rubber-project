import { Module } from '@nestjs/common';

import { SequentialWeighingController } from './sequential-weighing.controller';
import { SequentialWeighingService } from './sequential-weighing.service';
import { SequentialWeighingRepository } from './sequential-weighing.repository';

@Module({
  controllers: [SequentialWeighingController],
  providers: [SequentialWeighingService, SequentialWeighingRepository],
  exports: [SequentialWeighingService],
})
export class SequentialWeighingModule {}
