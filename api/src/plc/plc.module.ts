import { Module } from '@nestjs/common';
import { PlcController } from './plc.controller';
import { PlcService } from './plc.service';
import { InwardModule } from '../inward/inward.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [InwardModule],
  controllers: [PlcController],
  providers: [PlcService, PrismaService],
})
export class PlcModule {}
