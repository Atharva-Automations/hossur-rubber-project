import { Module } from '@nestjs/common';
import { BinService } from './bins.service';
import { BinController } from './bins.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BinController],
  providers: [BinService, PrismaService],
})
export class BinsModule {}
