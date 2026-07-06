import { Module } from '@nestjs/common';
import { ScannerController } from './scanner.controller';
import { ScannerService } from './scanner.service';
import { ProductionModule } from '../production/production.module';
import { WeighingModule } from '../bulk-weighing/weighing.module';

@Module({
  imports: [ProductionModule, WeighingModule],
  controllers: [ScannerController],
  providers: [ScannerService],
})
export class ScannerModule {}
