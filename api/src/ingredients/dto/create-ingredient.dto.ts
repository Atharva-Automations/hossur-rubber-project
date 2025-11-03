import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IngredientType } from '@prisma/client';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  ingredientCode!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(IngredientType, { message: 'Invalid ingredient type' })
  @IsNotEmpty()
  type!: IngredientType;

  @IsString()
  @IsNotEmpty()
  materialName!: string;
}
