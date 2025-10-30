import { Module } from '@nestjs/common';
import { OutwardController } from './outward.controller';
import { OutwardService } from './outward.service';

@Module({
  controllers: [OutwardController],
  providers: [OutwardService]
})
export class OutwardModule {}
