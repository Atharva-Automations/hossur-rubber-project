import { ExecutionMode } from '@prisma/client';
import { IsEnum, IsInt, Min } from 'class-validator';

export class CreateExecutionDto {
  @IsInt()
  recipeId!: number;

  @IsEnum(ExecutionMode)
  mode!: ExecutionMode;

  @IsInt()
  @Min(1)
  totalBatches!: number;
}