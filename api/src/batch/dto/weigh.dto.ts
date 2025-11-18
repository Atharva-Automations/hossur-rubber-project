// src/batch/dto/weigh.dto.ts
import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class WeighDto {
  @IsInt()
  batchId!: number;

  @IsInt()
  batchStepId!: number;

  @IsInt()
  batchIngredientId!: number;

  @IsNumber()
  @IsPositive()
  weight!: number;

  @IsOptional()
  label?: string;
}
