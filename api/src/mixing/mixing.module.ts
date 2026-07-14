import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MixingController } from './mixing.controller';
import { MixingService } from './mixing.service';

@Module({
  imports: [PrismaModule],
  controllers: [MixingController],
  providers: [MixingService],
})
export class MixingModule {}
