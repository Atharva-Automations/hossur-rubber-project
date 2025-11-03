import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { InwardModule } from '../inward/inward.module';
import { OutwardModule } from '../outward/outward.module';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { BinsModule } from '../bins/bins.module';

@Module({
  imports: [
    PrismaModule,
    InwardModule,
    OutwardModule,
    IngredientsModule,
    BinsModule,
  ],
})
export class AppModule {}
