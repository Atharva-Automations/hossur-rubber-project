import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { InventoryModule } from '../inventory/inventory.module';
import { BinsModule } from '../bins/bins.module';

@Module({
  imports: [PrismaModule, IngredientsModule, InventoryModule, BinsModule],
})
export class AppModule {}
