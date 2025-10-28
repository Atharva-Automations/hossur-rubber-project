import { Module } from '@nestjs/common';
import { BinsService } from './bins.service';
import { BinsController } from './bins.controller';

@Module({
  providers: [BinsService],
  controllers: [BinsController]
})
export class BinsModule {}
