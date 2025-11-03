import { Module } from '@nestjs/common';
import { BinsService } from './bins.service';
import { BinsController } from './bins.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BinsController],
  providers: [BinsService, PrismaService],
})
export class BinsModule {}
