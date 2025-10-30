import { Module } from '@nestjs/common';
import { InwardService } from './inward.service';
import { InwardController } from './inward.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [InwardController],
  providers: [InwardService, PrismaService],
})
export class InwardModule {}
