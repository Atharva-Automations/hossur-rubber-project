import { Module } from '@nestjs/common';
import { QcController } from './qc.controller';
import { QcService } from './qc.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [QcController],
  providers: [QcService, PrismaService],
})
export class QcModule {}