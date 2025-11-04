import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

@Module({
  controllers: [ProductionController],
  providers: [ProductionService, PrismaService],
})
export class ProductionModule {}
