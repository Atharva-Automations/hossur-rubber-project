import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { KneaderController } from './kneader.controller';
import { KneaderService } from './kneader.service';

@Module({
  imports: [PrismaModule],
  controllers: [KneaderController],
  providers: [KneaderService],
  exports: [KneaderService],
})
export class KneaderModule {}
