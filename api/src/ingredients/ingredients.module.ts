import { Module } from '@nestjs/common';
import { IngredientService } from './ingredients.service';
import { IngredientController } from './ingredients.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [IngredientController],
  providers: [IngredientService, PrismaService],
})
export class IngredientsModule {}
