import { IsInt } from 'class-validator';

export class RecipeWrittenDto {
  @IsInt()
  executionBatchId!: number;
}
