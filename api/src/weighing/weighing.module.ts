import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WeighingService } from './weighing.service';
import { WeighingController } from './weighing.controller';

@Module({
  controllers: [WeighingController],
  providers: [WeighingService, PrismaService],
  exports: [WeighingService],
})
export class WeighingModule {}
