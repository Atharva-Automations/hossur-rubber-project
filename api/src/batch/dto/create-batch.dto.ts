import { IsBoolean, IsInt, IsPositive } from 'class-validator';

export class CreateBatchDto {
  @IsInt()
  recipeId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsBoolean()
  enableKneader!: boolean;

  @IsBoolean()
  enableMixing!: boolean;
}
