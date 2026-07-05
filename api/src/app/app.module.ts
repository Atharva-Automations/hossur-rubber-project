import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { InwardModule } from '../inward/inward.module';
import { OutwardModule } from '../outward/outward.module';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { BinsModule } from '../bins/bins.module';
import { ProductionModule } from '../production/production.module';
import { RecipeModule } from '../recipe/recipe.module';
import { BatchModule } from '../batch/batch.module';
import { PrinterModule } from '../printer/printer.module';
import { ExecutionModule } from '../execution/execution.module';
import { ScannerModule } from '../scanner/scanner.module';
import { WeighingModule } from '../weighing/weighing.module';
// import { PlcModule } from '../plc/plc.module';

@Module({
  imports: [
    PrismaModule,
    InwardModule,
    OutwardModule,
    IngredientsModule,
    BinsModule,
    ProductionModule,
    RecipeModule,
    BatchModule,
    // PlcModule,
    PrinterModule,
    ExecutionModule,
    ScannerModule,
    WeighingModule,
  ],
})
export class AppModule {}
