// src/batch/dto/update-batch.dto.ts
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateBatchIngredientDto {
  @IsInt()
  id!: number; // existing BatchIngredient id

  @IsNumber()
  @Min(0)
  quantityPerUnit!: number;

  @IsOptional()
  unit?: string;
}

export class UpdateBatchStepDto {
  @IsInt()
  id!: number; // existing BatchStep id

  @IsInt()
  timerSeconds!: number;

  @IsNumber()
  pressure!: number;

  @IsNumber()
  temperature!: number;

  @IsNumber()
  rpm!: number;

  @IsArray()
  ingredients!: UpdateBatchIngredientDto[];
}

export class UpdateBatchDto {
  @IsInt()
  quantity!: number;

  @IsBoolean()
  enableKneader!: boolean;

  @IsBoolean()
  enableMixing!: boolean;

  @IsArray()
  steps!: UpdateBatchStepDto[];
}
